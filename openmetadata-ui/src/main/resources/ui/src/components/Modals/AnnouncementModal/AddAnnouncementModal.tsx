/*
 *  Copyright 2022 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Button, Form, Input, Modal, Space } from 'antd';
import { AxiosError } from 'axios';
import { DateTime } from 'luxon';
import { FC, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VALIDATION_MESSAGES } from '../../../constants/constants';
import {
  CreateThread,
  ThreadType,
} from '../../../generated/api/feed/createThread';
import { postThread } from '../../../rest/feedsAPI';
import { getTimeZone } from '../../../utils/date-time/DateTimeUtils';
import { getEntityFeedLink } from '../../../utils/EntityUtils';
import { showErrorToast, showSuccessToast } from '../../../utils/ToastUtils';

import { useSnackbar } from 'notistack';
import { useApplicationStore } from '../../../hooks/useApplicationStore';
import { FieldProp, FieldTypes } from '../../../interface/FormUtils.interface';
import { getField } from '../../../utils/formUtils';
import {
  showNotistackError,
  showNotistackSuccess,
} from '../../../utils/NotistackUtils';
import DatePicker from '../../common/DatePicker/DatePicker';
import './announcement-modal.less';

interface Props {
  open: boolean;
  entityType: string;
  entityFQN: string;
  onCancel: () => void;
  onSave: () => void;
  showToastInSnackbar?: boolean;
}

export interface CreateAnnouncement {
  title: string;
  description: string;
  startTime: DateTime;
  endTime: DateTime;
}

interface ConfirmDatePickerProps {
  value?: DateTime;
  onChange?: (date: DateTime | null) => void;
  className?: string;
}

const ConfirmDatePicker: FC<ConfirmDatePickerProps> = ({ value, onChange, className }) => {
  const [open, setOpen] = useState(false);
  const pendingRef = useRef<DateTime | null>(value ?? null);
  const closingRef = useRef(false);

  const close = () => {
    closingRef.current = true;
    setOpen(false);
  };

  const getContainer = (trigger: HTMLElement): HTMLElement =>
    (trigger.closest('.ant-modal') as HTMLElement) ?? document.body;

  return (
    <DatePicker
      className={className}
      dropdownClassName="confirm-date-picker-popup"
      getPopupContainer={getContainer}
      open={open}
      value={value}
      onChange={(date) => { pendingRef.current = date; }}
      onOpenChange={(o) => {
        if (closingRef.current) { closingRef.current = false; return; }
        if (o) { pendingRef.current = value ?? null; setOpen(true); }
      }}
      renderExtraFooter={() => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '4px 8px 8px' }}>
          <Button size="small" onClick={close}>Cancel</Button>
          <Button size="small" type="primary" onClick={() => { onChange?.(pendingRef.current); close(); }}>OK</Button>
        </div>
      )}
    />
  );
};

const AddAnnouncementModal: FC<Props> = ({
  open,
  onCancel,
  onSave,
  entityType,
  entityFQN,
  showToastInSnackbar = false,
}) => {
  const { currentUser } = useApplicationStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const handleCreateAnnouncement = async ({
    title,
    startTime,
    endTime,
    description,
  }: CreateAnnouncement) => {
    const startTimeMs = startTime.toMillis();
    const endTimeMs = endTime.toMillis();

    if (startTimeMs >= endTimeMs) {
      showToastInSnackbar
        ? showNotistackError(
            enqueueSnackbar,
            t('message.announcement-invalid-start-time')
          )
        : showErrorToast(t('message.announcement-invalid-start-time'));
    } else {
      const announcementData: CreateThread = {
        from: currentUser?.name as string,
        message: title,
        about: getEntityFeedLink(entityType, entityFQN),
        announcementDetails: {
          description,
          startTime: startTimeMs,
          endTime: endTimeMs,
        },
        type: ThreadType.Announcement,
      };
      try {
        setIsLoading(true);
        const data = await postThread(announcementData);
        if (data) {
          showToastInSnackbar
            ? showNotistackSuccess(
                enqueueSnackbar,
                t('message.announcement-created-successfully')
              )
            : showSuccessToast(t('message.announcement-created-successfully'));
        }
        onSave();
      } catch (error) {
        showToastInSnackbar
          ? showNotistackError(enqueueSnackbar, error as AxiosError)
          : showErrorToast(error as AxiosError);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const descriptionField: FieldProp = useMemo(
    () => ({
      name: 'description',
      required: false,
      label: `${t('label.description')}:`,
      id: 'root/description',
      type: FieldTypes.DESCRIPTION,
      props: {
        'data-testid': 'description',
        initialValue: '',
        placeHolder: t('message.write-your-announcement-lowercase'),
      },
    }),
    []
  );

  return (
    <Modal
      centered
      className="announcement-modal"
      closable={false}
      confirmLoading={isLoading}
      data-testid="add-announcement"
      maskClosable={false}
      okButtonProps={{
        id: 'announcement-submit',
        form: 'announcement-form',
        type: 'primary',
        htmlType: 'submit',
      }}
      okText="Submit"
      open={open}
      title={t('message.make-an-announcement')}
      width={720}
      onCancel={onCancel}>
      <Form<CreateAnnouncement>
        data-testid="announcement-form"
        id="announcement-form"
        layout="vertical"
        validateMessages={VALIDATION_MESSAGES}
        onFinish={handleCreateAnnouncement}>
        <Form.Item
          label={`${t('label.title')}:`}
          messageVariables={{ fieldName: 'title' }}
          name="title"
          rules={[
            {
              required: true,
              max: 124,
              min: 5,
            },
          ]}>
          <Input placeholder={t('label.announcement-title')} type="text" />
        </Form.Item>
        <Space className="announcement-date-space" size={16}>
          <Form.Item
            label={t('label.start-date-time-zone', {
              timeZone: getTimeZone(),
            })}
            messageVariables={{ fieldName: 'startDate' }}
            name="startTime"
            rules={[
              {
                required: true,
              },
            ]}>
            <ConfirmDatePicker className="w-full" />
          </Form.Item>
          <Form.Item
            label={t('label.end-date-time-zone', {
              timeZone: getTimeZone(),
            })}
            messageVariables={{ fieldName: 'endtDate' }}
            name="endTime"
            rules={[
              {
                required: true,
              },
            ]}>
            <ConfirmDatePicker className="w-full" />
          </Form.Item>
        </Space>
        {getField(descriptionField)}
      </Form>
    </Modal>
  );
};

export default AddAnnouncementModal;
