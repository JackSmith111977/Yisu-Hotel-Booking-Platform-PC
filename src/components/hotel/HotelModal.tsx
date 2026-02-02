import { useState } from 'react';
import { createHotels, createRoomTypes } from '@/actions/hotels';
import { 
    Form, 
    Input, 
    Modal, 
    Button, 
    Select, 
    DatePicker, 
    InputNumber,
    Space,
    Card,
    Grid,
    Rate,
    Cascader
} from '@arco-design/web-react';
import { IconPlus, IconDelete } from '@arco-design/web-react/icon';
import pcaData from 'china-division/dist/pca.json'
import { HotelRoomTypes } from '@/types/HotelInformation';

const FormItem = Form.Item;
const { Row, Col } = Grid;

const HotelModal = () => {
    const [visible, setVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);    // 确认弹窗状态
    const [form] = Form.useForm();

    const onOkay = async () => {
        try {
            const values = await form.validate();
            setConfirmLoading(true);
    
            // 整理酒店数据（不包含 room_types）
            const hotelData = {
                name_zh: values.nameZh,
                name_en: values.nameEn,
                address: values.region + values.address,
                star_rating: values.starRating,
                opening_date: values.openingDate,
                contact_phone: values.contactPhone,
                status: "draft" as const,
            };
            
            console.log('提交酒店数据:', hotelData);
            
            // 添加酒店数据
            const hotel = await createHotels(hotelData);            
            if (hotel) {
                // 关联酒店 ID 并创建房型
                if (values.roomTypes?.length > 0) {
                    const roomTypesData = values.roomTypes.map((room: HotelRoomTypes) => ({
                        hotel_id: hotel.id,  // 使用返回的酒店 ID
                        name: room.name,
                        price: room.price,
                        quantity: room.quantity,
                        size: room.size,
                        description: room.description,
                    }));
                    
                    console.log('提交房型数据:', roomTypesData);
                    await createRoomTypes(roomTypesData);  // 需要新建这个函数
                }
                
                setVisible(false);
                form.resetFields();
            }            
        } catch (error) {
            console.error('创建失败:', error);
        } finally {
            setConfirmLoading(false);
        }
    };

    const formItemLayout = {
        labelCol: {
        span: 4,
        },
        wrapperCol: {
        span: 20,
        },
    };

    // 地址选择函数
    function transformData(data) {
        return Object.entries(data).map(([province, cities]) => ({
          label: province,
          value: province,
          children: Object.entries(cities).map(([city, areas]) => ({
            label: city,
            value: city,
            children: areas.map(area => ({
              label: area,
              value: area
            }))
          }))
        }))
    }
    const options = transformData(pcaData)

    // 取消处理函数
    function handleCancel() {
        if (form.getTouchedFields().length > 0) {
            setConfirmVisible(true);  // 显示确认弹窗
        } else {
            setVisible(false);
        }
    }

    // 确认放弃更改
    function handleConfirmDiscard() {
        form.resetFields();
        setConfirmVisible(false);
        setVisible(false);
    }

    return (
        <div>
            <Button 
                onClick={() => {
                    setVisible(true);
                }} 
                type='primary' 
                status='success'
            >
                添加酒店
            </Button>
            <Modal
                title='添加酒店'
                style={{ width: '60%' }}
                visible={visible}
                onOk={onOkay}
                confirmLoading={confirmLoading}
                onCancel={() => {
                    // setVisible(false);
                    handleCancel();
                    // form.resetFields();
                }}
            >
                <Form
                    {...formItemLayout}
                    form={form}
                    labelCol={{ style: { flexBasis: 150 } }}
                    wrapperCol={{ style: { flexBasis: 'calc(95% - 150px)' } }}
                    scrollToFirstError
                >
                    {/* 基本信息 */}
                    <Card title="基本信息" style={{ marginBottom: 16 }}>
                        <FormItem 
                            label='酒店名称（中文）' 
                            field='nameZh' 
                            rules={[{ required: true, message: '请输入酒店中文名称' }]}
                        >
                            <Input placeholder='请输入酒店中文名称' />
                        </FormItem>

                        <FormItem 
                            label='酒店名称（英文）' 
                            field='nameEn' 
                            rules={[{ required: true, message: '请输入酒店英文名称' }]}
                        >
                            <Input placeholder='请输入酒店英文名称' />
                        </FormItem>
                        
                        <FormItem 
                            label='酒店地址' 
                            field='region' 
                            rules={[{ required: true, message: '请输入酒店地址' }]}
                        >
                            <Cascader options={options} placeholder="请选择地区" />
                            {/* <Input.TextArea 
                                placeholder='请输入酒店详细地址' 
                                autoSize={{ minRows: 2, maxRows: 4 }}
                            /> */}
                        </FormItem>

                        <Form.Item label="详细地址" field="address" rules={[{ required: true }]}>
                            <Input placeholder="请输入街道、门牌号等详细信息" />
                        </Form.Item>
                        
                        <FormItem 
                            label='酒店星级' 
                            field='starRating' 
                            rules={[{ required: true, message: '请选择酒店星级' }]}
                        >
                            <Rate />
                        </FormItem>
                        
                        <FormItem 
                            label='开业时间' 
                            field='openingDate' 
                            rules={[{ required: true, message: '请选择开业时间' }]}
                        >
                            <DatePicker style={{ width: '100%' }} placeholder='请选择开业时间' />
                        </FormItem>
                        
                        <FormItem 
                            label='联系电话' 
                            field='contactPhone' 
                            rules={[
                                { required: true, message: '请输入联系电话' },
                                { 
                                    match: /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/, 
                                    message: '请输入正确的电话格式' 
                                }
                            ]}
                        >
                            <Input placeholder='请输入联系电话' />
                        </FormItem>                        
                    </Card>
    
                    {/* 房型信息 - 动态表单 */}
                    <Card title="房型信息" style={{ marginBottom: 16 }}>
                        <Form.List field='roomTypes'>
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map((field, index) => (
                                        <Card 
                                            key={field.key} 
                                            style={{ marginBottom: 16, backgroundColor: '#fafafa' }}
                                            title={`房型 ${index + 1}`}
                                            extra={
                                                fields.length > 1 && (
                                                    <Button 
                                                        icon={<IconDelete />} 
                                                        status='danger'
                                                        type='text'
                                                        onClick={() => remove(index)}
                                                    >
                                                        删除
                                                    </Button>
                                                )
                                            }
                                        >
                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <FormItem 
                                                        label='房型名称' 
                                                        field={`${field.field}.name`}
                                                        rules={[{ required: true, message: '请输入房型名称' }]}
                                                        labelCol={{ span: 9 }}
                                                        wrapperCol={{ span: 15 }}
                                                    >
                                                        <Input placeholder='如：豪华大床房' />
                                                    </FormItem>
                                                </Col>
                                                <Col span={12}>
                                                    <FormItem 
                                                        label='价格(元/晚)' 
                                                        field={`${field.field}.price`}
                                                        rules={[{ required: true, message: '请输入价格' }]}
                                                        labelCol={{ span: 9 }}
                                                        wrapperCol={{ span: 15 }}
                                                    >
                                                        <InputNumber 
                                                            placeholder='请输入价格'
                                                            min={0}
                                                            precision={2}
                                                            style={{ width: '100%' }}
                                                            prefix='¥'
                                                        />
                                                    </FormItem>
                                                </Col>
                                            </Row>
                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <FormItem 
                                                        label='房间数量' 
                                                        field={`${field.field}.quantity`}
                                                        rules={[{ required: true, message: '请输入房间数量' }]}
                                                        labelCol={{ span: 9 }}
                                                        wrapperCol={{ span: 15 }}
                                                    >
                                                        <InputNumber 
                                                            placeholder='请输入数量'
                                                            min={1}
                                                            style={{ width: '100%' }}
                                                            suffix='间'
                                                        />
                                                    </FormItem>
                                                </Col>
                                                <Col span={12}>
                                                    <FormItem 
                                                        label='房间面积' 
                                                        field={`${field.field}.size`}
                                                        rules={[{ required: true, message: '请输入房间面积' }]}
                                                        labelCol={{ span: 9 }}
                                                        wrapperCol={{ span: 15 }}
                                                    >
                                                        <InputNumber 
                                                            placeholder='请输入面积'
                                                            min={1}
                                                            style={{ width: '100%' }}
                                                            suffix='㎡'
                                                        />
                                                    </FormItem>
                                                </Col>
                                            </Row>
                                            <FormItem 
                                                label='房型描述' 
                                                field={`${field.field}.description`}
                                                labelCol={{ span: 4 }}
                                                wrapperCol={{ span: 20 }}
                                            >
                                                <Input.TextArea 
                                                    placeholder='请输入房型描述，如：含早餐、免费WiFi等'
                                                    autoSize={{ minRows: 2, maxRows: 4 }}
                                                />
                                            </FormItem>
                                        </Card>
                                    ))}
                                    <Button 
                                        type='dashed' 
                                        long 
                                        icon={<IconPlus />}
                                        onClick={() => add()}
                                    >
                                        添加房型
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Card>
                </Form>
            </Modal>

            {/* 确认关闭弹窗 */}
            <Modal
                visible={confirmVisible}
                title="确认关闭"
                onCancel={() => setConfirmVisible(false)}
                onOk={handleConfirmDiscard}
                okText="放弃更改"
                cancelText="继续编辑"
                okButtonProps={{ status: 'danger' }}
                simple
            >
                <p style={{ margin: 0 }}>你有未保存的更改，确定要放弃吗？</p>
            </Modal>
        </div>
    );
}

export default HotelModal;