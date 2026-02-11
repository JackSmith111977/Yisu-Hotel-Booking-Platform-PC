import { useState } from 'react';
import { createHotels, createRoomTypes, updateHotel, replaceRoomTypes } from '@/actions/hotels';
import { 
    Form, 
    Input, 
    Modal, 
    Button, 
    DatePicker, 
    InputNumber,
    Card,
    Grid,
    Rate,
    Cascader,
    Message
} from '@arco-design/web-react';
import { IconPlus, IconDelete } from '@arco-design/web-react/icon';
import pcaData from 'china-division/dist/pca.json'
import { MineHotelInformationType, HotelRoomTypes, AddressDataType } from '@/types/HotelInformation';
import { Dispatch, SetStateAction, useEffect } from 'react';

const FormItem = Form.Item;
const { Row, Col } = Grid;

interface HotelModalProps {
    modalVisible: boolean;
    setModalVisible: Dispatch<SetStateAction<boolean>>;
    initialData?: MineHotelInformationType | null;
    onCreated?: () => void;
}

// 地址选择函数
function transformData(data: AddressDataType) {
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

const HotelModal = ({ modalVisible, setModalVisible, initialData, onCreated }: HotelModalProps) => {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);    // 确认弹窗状态
    const [form] = Form.useForm();

    const onOkay = async (okStatus: 'draft' | 'submit') => {
        try {
            // const values = await form.validate();
            // 草稿时跳过校验
            const values = okStatus === 'draft' ? form.getFieldsValue() : await form.validate();
            setConfirmLoading(true);
    
            // 整理酒店数据。编辑时保留原有 status，创建时设置为 pending。
            const hotelData: Partial<MineHotelInformationType> = {
                name_zh: values.nameZh,
                name_en: values.nameEn,
                region: values.region,
                address: values.address,
                star_rating: values.starRating,
                opening_date: values.openingDate,
                contact_phone: values.contactPhone,
                // ...(initialData ? { } : { status: okStatus === 'draft' ? 'draft' as const : 'pending' as const }),
                status: okStatus === 'draft' ? 'draft' : 'pending',
            };
            console.log('提交酒店数据:', hotelData);

            if (initialData) {
                // 编辑模式：更新酒店 + 替换房型
                const hotel = await updateHotel(initialData.id as number, {
                    ...hotelData,
                });

                if (hotel) {
                    if (values.roomTypes?.length > 0) {
                        const roomTypesData = values.roomTypes.map((room: HotelRoomTypes) => ({
                            name: room.name || '',
                            price: room.price,
                            quantity: room.quantity,
                            size: room.size,
                            description: room.description || '',
                        }));
                        console.log('替换房型数据:', roomTypesData);
                        await replaceRoomTypes(initialData.id as number, roomTypesData);
                    } else {
                        // 没有房型则清空
                        await replaceRoomTypes(initialData.id as number, []);
                    }

                    Message.success('更新成功');
                    setModalVisible(false);
                    if (onCreated) onCreated(); // 通知父组件刷新
                    form.resetFields();
                } else {
                    Message.error('更新失败');
                }
            } else {
                // 创建模式
                const hotel = await createHotels(hotelData as MineHotelInformationType);
                if (hotel) {
                    // 关联酒店 ID 并创建房型
                    if (values.roomTypes?.length > 0) {
                        const roomTypesData = values.roomTypes.map((room: HotelRoomTypes) => ({
                            hotel_id: hotel.id,
                            name: room.name || '',
                            price: room.price,
                            quantity: room.quantity,
                            size: room.size,
                            description: room.description || '',
                        }));
                        
                        console.log('提交房型数据:', roomTypesData);
                        await createRoomTypes(roomTypesData);
                    }
                    
                    setModalVisible(false);
                    if (onCreated) onCreated();   // 通知父组件已创建成功以触发刷新
                    form.resetFields();
                }
            }
        } catch (error) {
            console.error('创建/更新失败:', error);
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

    const OPTIONS = transformData(pcaData)

    // 取消处理函数
    function handleCancel() {
        if (form.getTouchedFields().length > 0) {
            setConfirmVisible(true);  // 显示确认弹窗
        } else {
            setModalVisible(false);
        }
    }

    // 确认放弃更改
    function handleConfirmDiscard() {
        form.resetFields();     
        setConfirmVisible(false)   
        setModalVisible(false);
    }

    useEffect(() => {
        if (modalVisible && initialData) {
          // 编辑模式填充数据
          form.setFieldsValue({
            nameZh: initialData.name_zh,
            nameEn: initialData.name_en,
            region: JSON.parse(initialData.region),
            address: initialData.address,
            starRating: initialData.star_rating,
            openingDate: initialData.opening_date,
            contactPhone: initialData.contact_phone,
            roomTypes: initialData.room_types,
          });
        } else if (modalVisible) {
          // 新建模式清空表单
          form.resetFields();
        }
      }, [modalVisible, initialData, form]);

    return (
        <div>            
            <Modal
                title={initialData ? '编辑酒店' : '添加酒店'}
                style={{ width: '60%' }}
                visible={modalVisible}
                confirmLoading={confirmLoading}
                onCancel={() => handleCancel()}
                footer={
                    <>
                      <Button onClick={() => handleCancel()}>取消</Button>
                      <Button onClick={() => onOkay('draft')}>保存草稿</Button>
                      <Button type="primary" status="success" onClick={() => onOkay('submit')}>确定</Button>
                    </>
                  }
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
                            <Cascader options={OPTIONS} placeholder="请选择地区" />
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