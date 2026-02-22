import { useState, useRef } from 'react';
import { Tag, Input, Tooltip } from '@arco-design/web-react';
import { IconPlus, IconClose } from '@arco-design/web-react/icon';

// ── 预设标签（分组，仅用于展示候选项） ─────────────────────────────
const PRESET_TAG_GROUPS = [
    {
        group: '设施服务',
        color: 'arcoblue',
        tags: ['免费WiFi', '免费停车', '24小时前台', '行李寄存', '叫醒服务', '外币兑换'],
    },
    {
        group: '餐饮',
        color: 'green',
        tags: ['含早餐', '含双早', '西餐厅', '中餐厅', '酒吧', '咖啡厅', '客房送餐'],
    },
    {
        group: '休闲娱乐',
        color: 'purple',
        tags: ['室内游泳池', '室外游泳池', '健身中心', 'SPA水疗', '桑拿', '儿童乐园', '棋牌室'],
    },
    {
        group: '商务',
        color: 'orangered',
        tags: ['商务中心', '会议室', '免费打印', 'VIP贵宾室', '机场接送'],
    },
    {
        group: '位置特色',
        color: 'gold',
        tags: ['市中心', '海景房', '山景房', '近地铁', '近景区', '度假村'],
    },
];

// 所有预设标签拍平，方便查重
const ALL_PRESET_TAGS = PRESET_TAG_GROUPS.flatMap(g => g.tags);

// 根据标签名查找对应 color
function getTagColor(name: string): string {
    for (const group of PRESET_TAG_GROUPS) {
        if (group.tags.includes(name)) return group.color;
    }
    return 'cyan'; // 自定义标签颜色
}

// ── Props ──────────────────────────────────────────────────────────
interface HotelTagSelectorProps {
    value?: string[];
    onChange?: (tags: string[]) => void;
}

export default function HotelTagSelector({ value = [], onChange }: HotelTagSelectorProps) {
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const selected = value ?? [];

    function toggle(tag: string) {
        const next = selected.includes(tag)
            ? selected.filter(t => t !== tag)
            : [...selected, tag];
        onChange?.(next);
    }

    function removeTag(tag: string) {
        onChange?.(selected.filter(t => t !== tag));
    }

    function confirmAdd() {
        const trimmed = inputValue.trim();
        if (trimmed && !selected.includes(trimmed)) {
            onChange?.([...selected, trimmed]);
        }
        setInputValue('');
        setInputVisible(false);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') confirmAdd();
        if (e.key === 'Escape') { setInputVisible(false); setInputValue(''); }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* ── 预设候选标签（按分组） ── */}
            {PRESET_TAG_GROUPS.map(group => (
                <div key={group.group} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#86909c', minWidth: 52, flexShrink: 0 }}>
                        {group.group}
                    </span>
                    {group.tags.map(tag => {
                        const active = selected.includes(tag);
                        return (
                            <Tag
                                key={tag}
                                color={active ? group.color : undefined}
                                onClick={() => toggle(tag)}
                                style={{
                                    cursor: 'pointer',
                                    borderStyle: active ? 'solid' : 'dashed',
                                    borderColor: active ? undefined : '#c9cdd4',
                                    background: active ? undefined : 'transparent',
                                    color: active ? undefined : '#4e5969',
                                    userSelect: 'none',
                                    transition: 'all .15s',
                                }}
                            >
                                {tag}
                            </Tag>
                        );
                    })}
                </div>
            ))}

            {/* ── 分隔线 ── */}
            <div style={{ borderTop: '1px dashed #e5e6eb', margin: '0 0 4px' }} />

            {/* ── 已选标签 + 新增输入 ── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#86909c', flexShrink: 0 }}>已选标签</span>

                {selected.map(tag => (
                    <Tag
                        key={tag}
                        color={getTagColor(tag)}
                        closable
                        onClose={() => removeTag(tag)}
                        style={{ cursor: 'default' }}
                    >
                        {tag}
                    </Tag>
                ))}

                {selected.length === 0 && (
                    <span style={{ fontSize: 12, color: '#c9cdd4' }}>暂未选择任何标签</span>
                )}

                {/* "+ 新增" 虚线按钮 */}
                {inputVisible ? (
                    <Input
                        ref={inputRef}
                        autoFocus
                        size="mini"
                        value={inputValue}
                        onChange={setInputValue}
                        onBlur={confirmAdd}
                        onKeyDown={handleKeyDown}
                        placeholder="输入后回车确认"
                        style={{ width: 120 }}
                    />
                ) : (
                    <Tag
                        onClick={() => { setInputVisible(true); setTimeout(() => inputRef.current?.focus(), 0); }}
                        style={{
                            cursor: 'pointer',
                            borderStyle: 'dashed',
                            borderColor: '#c9cdd4',
                            background: 'transparent',
                            color: '#4e5969',
                            userSelect: 'none',
                        }}
                    >
                        <IconPlus style={{ marginRight: 2 }} />
                        新增
                    </Tag>
                )}
            </div>
        </div>
    );
}