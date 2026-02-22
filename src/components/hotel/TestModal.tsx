import { Form, Input, Button, Message } from '@arco-design/web-react';
import { useState } from 'react';

const FormItem = Form.Item;

const TestForm = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onSubmit = () => {
        form.validate().then((values) => {
            setLoading(true);
            console.log('表单数据:', values);
            setTimeout(() => {
                Message.success('提交成功！');
                form.resetFields();
                setLoading(false);
            }, 1000);
        });
    };

    return (
        <Form
            form={form}
            labelCol={{ style: { flexBasis: 90 } }}
            wrapperCol={{ style: { flexBasis: 'calc(100% - 90px)' } }}
            style={{ maxWidth: 500 }}
        >
            <FormItem
                label="用户名"
                field="username"
                rules={[{ required: true, message: '请输入用户名' }]}
            >
                <Input placeholder="请输入用户名" />
            </FormItem>

            <FormItem
                label="邮箱"
                field="email"
                rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入合法的邮箱地址' },
                ]}
            >
                <Input placeholder="请输入邮箱" />
            </FormItem>

            <FormItem wrapperCol={{ style: { flexBasis: 'calc(100% - 90px)', marginLeft: 90 } }}>
                <Button type="primary" loading={loading} onClick={onSubmit}>
                    提交
                </Button>
                <Button style={{ marginLeft: 12 }} onClick={() => form.resetFields()}>
                    重置
                </Button>
            </FormItem>
        </Form>
    );
};

export default TestForm;