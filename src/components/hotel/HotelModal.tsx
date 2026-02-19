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
    Cascader
} from '@arco-design/web-react';
import { IconPlus, IconDelete } from '@arco-design/web-react/icon';
import pcaData from 'china-division/dist/pca.json'
import { MineHotelInformationType, HotelRoomTypes, AddressDataType } from '@/types/HotelInformation';
import ImageUploader, { UploadedImage } from './ImageUploader';
import { uploadHotelImages, deleteStorageFolder } from '@/actions/hotels';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { toast } from 'sonner';

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
            const values = okStatus === 'draft' ? form.getFieldsValue() : await form.validate();
            setConfirmLoading(true);
    
            const hotelData: Partial<MineHotelInformationType> = {
                name_zh: values.nameZh,
                name_en: values.nameEn,
                region: values.region,
                address: values.address,
                star_rating: values.starRating,
                opening_date: values.openingDate,
                contact_phone: values.contactPhone,
                status: okStatus === 'draft' ? 'draft' : 'pending',
                // 图片字段先不在此处填入，创建/编辑分支各自处理后再传入
            };
    
            if (initialData) {
                // ── 编辑模式 ─────────────────────────────────────────────────────
    
                // 新增：上传酒店图片（先清理旧文件，再上传新图）
                const editImgInputs: UploadedImage[] = values.hotelImages ?? [];
                const editImgDataUrls = editImgInputs.map(img => img.remoteUrl ?? img.dataUrl);
                await deleteStorageFolder(`hotel_${initialData.id}`);
                const uploadedHotelUrls = await uploadHotelImages(
                    editImgDataUrls,
                    `hotel_${initialData.id}`,
                );
    
                const hotel = await updateHotel(initialData.id as number, {
                    ...hotelData,
                    image: uploadedHotelUrls[0] ?? null,    // 新增：首图
                    album: uploadedHotelUrls.slice(1),      // 新增：相册
                });
    
                if (hotel) {
                    if (values.roomTypes?.length > 0) {
                        // 新增：map 改为 async + Promise.all，支持房型图片上传
                        const roomTypesData = await Promise.all(
                            values.roomTypes.map(async (room: HotelRoomTypes & { images?: UploadedImage[] }, index: number) => {
                                // 新增：上传房型图片
                                const roomImgDataUrls = (room.images ?? []).map(img => {
                                    const i = img as unknown as UploadedImage;
                                    console.log('img item:', i, 'remoteUrl:', i.remoteUrl, 'dataUrl:', i.dataUrl);
                                    return i.remoteUrl ?? i.dataUrl;
                                });
                                const uploadedRoomUrls = await uploadHotelImages(
                                    roomImgDataUrls,
                                    `hotel_${initialData.id}/room_${index}`,
                                );
                                return {
                                    name: room.name || '',
                                    price: room.price,
                                    quantity: room.quantity,
                                    size: room.size,
                                    description: room.description || '',
                                    images: uploadedRoomUrls,   // 新增：房型图片 URL 数组
                                };
                            })
                        );
                        console.log('替换房型数据:', roomTypesData);
                        await replaceRoomTypes(initialData.id as number, roomTypesData);
                    } else {
                        await replaceRoomTypes(initialData.id as number, []);
                    }
    
                    toast.success('更新成功');
                    setModalVisible(false);
                    if (onCreated) onCreated();
                    form.resetFields();
                } else {
                    toast.error('更新失败');
                }
    
            } else {
                // ── 创建模式 ─────────────────────────────────────────────────────
    
                // 先 insert 酒店骨架（不含图片），拿到 id 后再上传
                const hotel = await createHotels(hotelData as MineHotelInformationType);
    
                if (hotel) {
                    // 新增：拿到 hotel.id 后上传酒店图片，再 update 图片字段
                    const hotelImgInputs: UploadedImage[] = values.hotelImages ?? [];
                    const hotelImgDataUrls = hotelImgInputs.map(img => img.remoteUrl ?? img.dataUrl);
                    const uploadedHotelUrls = await uploadHotelImages(
                        hotelImgDataUrls,
                        `hotel_${hotel.id}`,
                    );
                    await updateHotel(hotel.id, {
                        image: uploadedHotelUrls[0] ?? null,    // 新增：首图
                        album: uploadedHotelUrls.slice(1),      // 新增：相册
                    });
    
                    if (values.roomTypes?.length > 0) {
                        // 新增：同编辑模式，改为 async + Promise.all
                        const roomTypesData = await Promise.all(
                            values.roomTypes.map(async (room: HotelRoomTypes & { images?: UploadedImage[] }, index: number) => {
                                // 新增：上传房型图片
                                const roomImgDataUrls = (room.images ?? []).map(img => {
                                    const i = img as unknown as UploadedImage;
                                    console.log('img item:', i, 'remoteUrl:', i.remoteUrl, 'dataUrl:', i.dataUrl);
                                    return i.remoteUrl ?? i.dataUrl;
                                });
                                const uploadedRoomUrls = await uploadHotelImages(
                                    roomImgDataUrls,
                                    `hotel_${hotel.id}/room_${index}`,
                                );
                                return {
                                    hotel_id: hotel.id,
                                    name: room.name || '',
                                    price: room.price,
                                    quantity: room.quantity,
                                    size: room.size,
                                    description: room.description || '',
                                    images: uploadedRoomUrls,   // 新增：房型图片 URL 数组
                                };
                            })
                        );
                        console.log('提交房型数据:', roomTypesData);
                        await createRoomTypes(roomTypesData);
                    }
    
                    setModalVisible(false);
                    if (onCreated) onCreated();
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
            hotelImages: [
                ...(initialData.image ? [{ dataUrl: initialData.image, remoteUrl: initialData.image }] : []),
                ...(initialData.album ?? []).map(url => ({ dataUrl: url, remoteUrl: url })),
            ],
            roomTypes: (initialData.room_types ?? []).map(rt => ({
                ...rt,
                // 新增：将 string[] 转成 UploadedImage[] 供 ImageUploader 展示
                images: (rt.images ?? []).map((url: string) => ({ dataUrl: url, remoteUrl: url })),
            })),
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
                      <Button type="primary" status="success" onClick={() => onOkay('submit')}>提交</Button>
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

                        <FormItem
                            label="酒店图片"
                            field="hotelImages"
                            rules={[{
                                validator: (value, callback) =>
                                    (value?.length ?? 0) === 0 ? callback('请至少上传一张酒店图片') : callback()
                            }]}
                        >
                            <ImageUploader max={9} label="酒店图片" />
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
                                            <FormItem
                                                label="房型图片"
                                                field={`${field.field}.images`}
                                                labelCol={{ span: 4 }}
                                                wrapperCol={{ span: 20 }}
                                                rules={[{
                                                    validator: (value, callback) =>
                                                        (value?.length ?? 0) === 0 ? callback('请至少上传一张房型图片') : callback()
                                                }]}
                                            >
                                                <ImageUploader max={6} label="房型图片" />
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