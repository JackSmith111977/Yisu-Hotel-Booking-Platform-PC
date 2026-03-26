import { useState } from 'react';
import { createHotelWithRooms, updateHotelWithRooms, uploadHotelImages, deleteStorageFolder } from '@/actions/hotels';
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
    Select
} from '@arco-design/web-react';
import { IconPlus, IconDelete } from '@arco-design/web-react/icon';
import pcaData from 'china-division/dist/pca.json'
import { MineHotelInformationType, HotelRoomTypes, AddressDataType } from '@/types/HotelInformation';
import ImageUploader, { UploadedImage } from './ImageUploader';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { toast } from 'sonner';
import HotelTagSelector from './HotelTagSelector';
import RoomTagSelector from './RoomTagSelector';

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

// 床型选项
const BED_TYPE_OPTIONS = [
    { label: '大床', value: '大床' },
    { label: '双床', value: '双床' },
    { label: '单床', value: '单床' },
    { label: '上下铺', value: '上下铺' },
    { label: '沙发床', value: '沙发床' },
];

const OPTIONS = transformData(pcaData)

const HotelModal = ({ modalVisible, setModalVisible, initialData, onCreated }: HotelModalProps) => {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);    // 确认弹窗状态
    const [submitStep, setSubmitStep] = useState('');
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
                tags: values.tags ?? [],
            };

            if (initialData) {
                // ── 编辑模式 ──────────────────────────────────────────────
                const folder = `hotel_${initialData.id}`;

                // 1. 清理旧图片（失败不中断流程）
                setSubmitStep('正在清理旧图片...');
                await deleteStorageFolder(folder).catch(e =>
                    console.warn('清理旧图片失败，继续执行:', e)
                );

                // 2. 上传酒店封面 + 相册
                setSubmitStep('正在上传酒店图片...');
                const editImgDataUrls = (values.hotelImages as UploadedImage[] ?? [])
                    .map(img => img.remoteUrl ?? img.dataUrl);
                const uploadedHotelUrls = await uploadHotelImages(editImgDataUrls, folder);

                // 3. 上传各房型图片
                setSubmitStep('正在上传房型图片...');
                const roomTypesData = await Promise.all(
                    (values.roomTypes ?? []).map(async (room: HotelRoomTypes & { images?: UploadedImage[] }, index: number) => {
                        const roomImgDataUrls = (room.images ?? []).map(img => {
                            const i = img as unknown as UploadedImage;
                            return i.remoteUrl ?? i.dataUrl;
                        });
                        const uploadedRoomUrls = await uploadHotelImages(
                            roomImgDataUrls,
                            `${folder}/room_${index}`,
                        );
                        return {
                            name: room.name || '',
                            price: room.price,
                            size: room.size,
                            max_guests: room.max_guests,
                            quantity: room.quantity,
                            beds: room.beds ?? [],
                            facilities: room.facilities ?? [],
                            description: room.description || '',
                            images: uploadedRoomUrls,
                        };
                    })
                );

                // 4. RPC 事务更新酒店 + 替换房型
                setSubmitStep('正在更新酒店信息...');
                await updateHotelWithRooms(
                    initialData.id as number,
                    { ...hotelData, image: uploadedHotelUrls[0] ?? null, album: uploadedHotelUrls.slice(1) },
                    roomTypesData,
                );

            } else {
                // ── 创建模式 ──────────────────────────────────────────────
                const tempFolder = `hotel_temp_${Date.now()}`;

                // 1. 上传酒店封面 + 相册
                setSubmitStep('正在上传酒店图片...');
                const hotelImgDataUrls = (values.hotelImages as UploadedImage[] ?? [])
                    .map(img => img.remoteUrl ?? img.dataUrl);
                const uploadedHotelUrls = await uploadHotelImages(hotelImgDataUrls, tempFolder);

                // 2. 上传各房型图片
                setSubmitStep('正在上传房型图片...');
                const roomTypesData = await Promise.all(
                    (values.roomTypes ?? []).map(async (room: HotelRoomTypes & { images?: UploadedImage[] }, index: number) => {
                        const roomImgDataUrls = (room.images ?? []).map(img => {
                            const i = img as unknown as UploadedImage;
                            return i.remoteUrl ?? i.dataUrl;
                        });
                        const uploadedRoomUrls = await uploadHotelImages(
                            roomImgDataUrls,
                            `${tempFolder}/room_${index}`,
                        );
                        return {
                            name: room.name || '',
                            price: room.price,
                            size: room.size,
                            max_guests: room.max_guests,
                            quantity: room.quantity,
                            beds: room.beds ?? [],
                            facilities: room.facilities ?? [],
                            description: room.description || '',
                            images: uploadedRoomUrls,
                        };
                    })
                );

                // 3. RPC 事务创建酒店 + 房型
                setSubmitStep('正在创建酒店...');
                await createHotelWithRooms(
                    { ...hotelData, image: uploadedHotelUrls[0] ?? null, album: uploadedHotelUrls.slice(1) },
                    roomTypesData,
                );
            }

            toast.success(okStatus === 'draft' ? '草稿已保存' : (initialData ? '更新成功' : '提交成功'));
            setModalVisible(false);
            if (onCreated) onCreated();
            form.resetFields();

        } catch (error) {
            // form.validate() 验证不通过时抛出带 errors 属性的对象，表单已有内联提示
            if (error && typeof error === 'object' && 'errors' in error) {
                toast.warning('请检查表单填写是否完整');
                return;
            }
            console.error('创建/更新失败:', error);
            const message = error instanceof Error ? error.message : '未知错误';
            toast.error(`操作失败：${message}`);
        } finally {
            setConfirmLoading(false);
            setSubmitStep('');
        }
    };

    const formItemLayout = {
        labelCol: { span: 5 },
        wrapperCol: { span: 19 },
    };

    function handleCancel() {
        if (form.getTouchedFields().length > 0) {
            setConfirmVisible(true);
        } else {
            setModalVisible(false);
        }
    }

    function handleConfirmDiscard() {
        form.resetFields();     
        setConfirmVisible(false)   
        setModalVisible(false);
    }

    useEffect(() => {
        if (modalVisible && initialData) {
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
                images: (rt.images ?? []).map((url: string) => ({ dataUrl: url, remoteUrl: url })),
                // facilities 直接透传（原来的 tags 字段已对应 facilities）
            })),
            tags: initialData.tags ?? [],
          });
        } else if (modalVisible) {
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
                getPopupContainer={() => document.body} // 指向离它最近的固定容器
                footer={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ color: 'var(--color-text-3)', fontSize: 13 }}>{submitStep}</span>
                        <div>
                            <Button onClick={() => handleCancel()} style={{ marginRight: 8 }}>取消</Button>
                            <Button onClick={() => onOkay('draft')} style={{ marginRight: 8 }}>保存草稿</Button>
                            <Button type="primary" status="success" onClick={() => onOkay('submit')}>提交</Button>
                        </div>
                    </div>
                }
            >
                <Form
                    {...formItemLayout}
                    form={form}
                    requiredSymbol={{ position: 'start' }}
                    style={{ maxWidth: 2000 }}
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
                                required: true,
                                validator: (value, callback) =>
                                    (value?.length ?? 0) === 0 ? callback('请至少上传一张酒店图片') : callback()
                            }]}
                        >
                            <ImageUploader max={9} label="酒店图片" />
                        </FormItem>

                        <FormItem
                            label="酒店标签"
                            field="tags"
                        >
                            <HotelTagSelector />
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
                                            style={{ marginBottom: 16, backgroundColor: 'var(--color-fill-2)' }}
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
                                                <Col span={12}>
                                                    {/* 最大入住人数 */}
                                                    <FormItem 
                                                        label='最大入住人数' 
                                                        field={`${field.field}.max_guests`}
                                                        rules={[{ required: true, message: '请输入最大入住人数' }]}
                                                        labelCol={{ span: 9 }}
                                                        wrapperCol={{ span: 15 }}
                                                    >
                                                        <InputNumber 
                                                            placeholder='请输入人数'
                                                            min={1}
                                                            style={{ width: '100%' }}
                                                            suffix='人'
                                                        />
                                                    </FormItem>
                                                </Col>
                                                <Col span={12}>
                                                    {/* 房间数量 */}
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
                                            </Row>

                                            {/* 新增：床型信息（动态列表） */}
                                            <FormItem
                                                label="床型配置"
                                                labelCol={{ span: 4 }}
                                                wrapperCol={{ span: 20 }}
                                            >
                                                <Form.List field={`${field.field}.beds`}>
                                                    {(bedFields, { add: addBed, remove: removeBed }) => (
                                                        <>
                                                            {bedFields.map((bedField, bedIndex) => (
                                                                <Row key={bedField.key} gutter={8} style={{ marginBottom: 8 }}>
                                                                    <Col span={11}>
                                                                        <FormItem
                                                                            field={`${bedField.field}.type`}
                                                                            rules={[{ required: true, message: '请选择床型' }]}
                                                                            noStyle={false}
                                                                            style={{ marginBottom: 0 }}
                                                                        >
                                                                            <Select placeholder="请选择床型" options={BED_TYPE_OPTIONS} />
                                                                        </FormItem>
                                                                    </Col>
                                                                    <Col span={10}>
                                                                        <FormItem
                                                                            field={`${bedField.field}.count`}
                                                                            rules={[{ required: true, message: '请输入数量' }]}
                                                                            noStyle={false}
                                                                            style={{ marginBottom: 0 }}
                                                                        >
                                                                            <InputNumber
                                                                                placeholder='数量'
                                                                                min={1}
                                                                                style={{ width: '100%' }}
                                                                                suffix='张'
                                                                            />
                                                                        </FormItem>
                                                                    </Col>
                                                                    <Col span={3} style={{ display: 'flex', alignItems: 'center' }}>
                                                                        <Button
                                                                            icon={<IconDelete />}
                                                                            status='danger'
                                                                            type='text'
                                                                            onClick={() => removeBed(bedIndex)}
                                                                        />
                                                                    </Col>
                                                                </Row>
                                                            ))}
                                                            <Button
                                                                type='dashed'
                                                                size='small'
                                                                icon={<IconPlus />}
                                                                onClick={() => addBed()}
                                                            >
                                                                添加床型
                                                            </Button>
                                                        </>
                                                    )}
                                                </Form.List>
                                            </FormItem>

                                            {/* facilities（原 tags 字段改名） */}
                                            <FormItem
                                                label="房间设施"
                                                field={`${field.field}.facilities`}
                                                labelCol={{ span: 4 }}
                                                wrapperCol={{ span: 20 }}
                                            >
                                                <RoomTagSelector />
                                            </FormItem>

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
                                                    required: true,
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