import { useState } from 'react';
import { Modal, Button, Form, Input, Select, Message } from '@arco-design/web-react';
const FormItem = Form.Item;

const HotelModal = () => {
    const [visible, setVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();

    function onOk() {
        form.validate().then((res) => {
            setConfirmLoading(true);
            setTimeout(() => {
                Message.success('Success !');
                setVisible(false);
                setConfirmLoading(false);
            }, 1500);
        });
    }

    const formItemLayout = {
        labelCol: {
        span: 4,
        },
        wrapperCol: {
        span: 20,
        },
    };
    return (
        <div>
            <Button onClick={() => setVisible(true)} type='primary' status='success'>
                添加酒店
            </Button>
            <Modal
                title='添加酒店'
                style={{ width: '50%' }}
                visible={visible}
                onOk={onOk}
                confirmLoading={confirmLoading}
                onCancel={() => setVisible(false)}
            >
                <Form
                {...formItemLayout}
                form={form}
                labelCol={{
                    style: { flexBasis: 150 },
                }}
                wrapperCol={{
                    style: { flexBasis: 'calc(95% - 150px)' },
                }}
                >
                    <FormItem label='酒店名称（中文）' field='NameZh' rules={[{ required: true }]}>
                        <Input placeholder='' />
                    </FormItem>
                    <FormItem label='酒店名称（英文）' field='NameEn' rules={[{ required: true }]}>
                        <Input placeholder='' />
                    </FormItem>
                    <FormItem label='地址' field='Address' rules={[{ required: true }]}>
                        <Select
                            // placeholder='please select'
                            // options={[
                            // {
                            //     label: 'one',
                            //     value: 0,
                            // },
                            // {
                            //     label: 'two',
                            //     value: 1,
                            // },
                            // {
                            //     label: 'three',
                            //     value: 2,
                            // },
                            // ]}
                            // allowClear
                        />
                    </FormItem>

                    {/* <FormItem label='Name' field='name' rules={[{ required: true }]}>
                        <Input placeholder='' />
                    </FormItem>
                    <FormItem label='Gender' required field='sex' rules={[{ required: true }]}>
                        <Select options={['男', '女']} />
                    </FormItem> */}
                </Form>
            </Modal>
        </div>
    );
}

export default HotelModal;