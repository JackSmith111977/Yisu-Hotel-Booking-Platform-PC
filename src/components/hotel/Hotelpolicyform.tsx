import {
    Form,
    TimePicker,
    Radio,
    Grid,
    Card,
} from '@arco-design/web-react';

const { Row, Col } = Grid;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const PET_OPTIONS = [
    { label: '允许携带宠物', value: 'allowed' },
    { label: '不允许', value: 'not_allowed' },
];

const EXTRA_BED_OPTIONS = [
    { label: '可加床（免费）', value: 'free' },
    { label: '可加床（收费）', value: 'charged' },
    { label: '不可加床', value: 'not_available' },
];

const INVOICE_OPTIONS = [
    { label: '可开发票', value: 'available' },
    { label: '不可开发票', value: 'not_available' },
];

export default function HotelPolicyForm() {
    return (
        <Card title="酒店政策" style={{ marginBottom: 16 }}>
            <Row gutter={24}>
                <Col span={12}>
                    <FormItem
                        label="入住时间"
                        field="policy.check_in_time"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        rules={[{ required: true }]}
                    >
                        <TimePicker
                            format="HH:mm"
                            placeholder="请选择"
                            style={{ width: '100%' }}
                        />
                    </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem
                        label="退房时间"
                        field="policy.check_out_time"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        rules={[{ required: true }]}
                    >
                        <TimePicker
                            format="HH:mm"
                            placeholder="请选择"
                            style={{ width: '100%' }}
                        />
                    </FormItem>
                </Col>
            </Row>

            <FormItem label="宠物政策" field="policy.pet_policy" rules={[{ required: true }]}>
                <RadioGroup options={PET_OPTIONS} />
            </FormItem>

            <FormItem label="加床政策" field="policy.extra_bed_policy" rules={[{ required: true }]}>
                <RadioGroup options={EXTRA_BED_OPTIONS} />
            </FormItem>

            <FormItem label="发票政策" field="policy.invoice_policy" rules={[{ required: true }]}>
                <RadioGroup options={INVOICE_OPTIONS} />
            </FormItem>
        </Card>
    );
}