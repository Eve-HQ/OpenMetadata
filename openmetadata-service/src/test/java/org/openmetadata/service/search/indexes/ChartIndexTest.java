package org.openmetadata.service.search.indexes;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.openmetadata.schema.entity.data.Chart;
import org.openmetadata.service.Entity;
import org.openmetadata.service.jdbi3.CollectionDAO;
import org.openmetadata.service.jdbi3.EntityRepository;
import org.openmetadata.service.search.SearchRepository;

/**
 * Regression test for EVE-753 phase 2: ChartIndex must initialize "upstreamLineage" on every
 * search doc it builds, the same way DashboardIndex/TableIndex/PipelineIndex already do.
 *
 * <p>Without it, the chart's Elasticsearch/OpenSearch document has no "upstreamLineage" key at
 * all, so OM's ADD_UPDATE_LINEAGE painless script (SearchClient.java) throws script_exception:
 * runtime error the first time a table->chart lineage edge is written, because the script assumes
 * ctx._source.upstreamLineage is already a (possibly empty) list.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ChartIndexTest {

  @Mock private CollectionDAO collectionDAO;
  @Mock private CollectionDAO.EntityRelationshipDAO relationshipDAO;
  @Mock private SearchRepository searchRepository;
  @Mock private EntityRepository<Chart> chartRepository;

  private CollectionDAO originalCollectionDAO;
  private SearchRepository originalSearchRepository;

  @BeforeEach
  void setUp() {
    originalCollectionDAO = Entity.getCollectionDAO();
    originalSearchRepository = Entity.getSearchRepository();
    when(collectionDAO.relationshipDAO()).thenReturn(relationshipDAO);
    when(relationshipDAO.findFrom(any(UUID.class), anyString(), anyInt()))
        .thenReturn(Collections.emptyList());
    Entity.setCollectionDAO(collectionDAO);
    // SearchIndex's static searchClient field is eagerly initialized from
    // Entity.getSearchRepository() the first time any SearchIndex static method (e.g.
    // getLineageData) is invoked, so it must be non-null before that first call.
    if (Entity.getSearchRepository() == null) {
      Entity.setSearchRepository(searchRepository);
    }
    // getCommonAttributesMap() -> Entity.getEntityTags() looks up the "chart" repository from
    // Entity's global registry, which is otherwise only populated by full app bootstrap.
    when(chartRepository.getAllTags(any())).thenReturn(Collections.emptyList());
    Entity.registerEntity(Chart.class, Entity.CHART, chartRepository);
  }

  @AfterEach
  void tearDown() {
    Entity.setCollectionDAO(originalCollectionDAO);
    Entity.setSearchRepository(originalSearchRepository);
  }

  @Test
  void buildSearchIndexDocInternal_initializesUpstreamLineage() {
    Chart chart =
        new Chart()
            .withId(UUID.randomUUID())
            .withName("revenue_chart")
            .withFullyQualifiedName("tableau.analytics.revenue_chart");

    Map<String, Object> doc = new ChartIndex(chart).buildSearchIndexDocInternal(new HashMap<>());

    assertTrue(doc.containsKey("upstreamLineage"), "chart doc must carry an upstreamLineage key");
    assertNotNull(doc.get("upstreamLineage"), "upstreamLineage must not be null");
    assertEquals(Collections.emptyList(), doc.get("upstreamLineage"));
  }
}
