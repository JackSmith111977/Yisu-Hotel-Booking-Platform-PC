"use client";

import { Form, Input, Modal } from "@arco-design/web-react";
import useForm from "@arco-design/web-react/es/Form/useForm";
import { useEffect } from "react";

interface RejectModalProps {
  visible: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

/**
 * 拒绝对话框
 * @function 用于填写拒绝理由
 * @param visible 显示状态
 * @param onCancel 取消回调
 * @param onConfirm 确定回调
 * @returns
 */
export default function RejectModal({ visible, onCancel, onConfirm, loading }: RejectModalProps) {
  const [form] = useForm();

  // 每次打开表单，重置表单
  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      // 触发表单验证
      const values = await form.validate();
      // 验证通过，提交数据给父组件
      onConfirm(values.reason);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Modal
      title="驳回申请"
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      // loading 时禁用，防止频繁操作
      okButtonProps={{ status: "danger", disabled: loading }} // 危险按钮
      cancelButtonProps={{ disabled: loading }}
      okText="确认驳回"
      unmountOnExit // 销毁组件
    >
      {/* 填写拒绝理由 */}
      <Form form={form} layout="vertical">
        <Form.Item
          label="拒绝理由"
          field="reason"
          rules={[
            { required: true, message: "请填写驳回原因" },
            { minLength: 5, message: "原因至少需要5个字" },
          ]}
        >
          <Input.TextArea placeholder="请填写驳回原因" rows={4} maxLength={200} showWordLimit />
        </Form.Item>
      </Form>
    </Modal>
  );
}
