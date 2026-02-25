import { useState, useRef } from 'react';
import { Tag, Input } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { RefInputType } from '@arco-design/web-react/es/Input/interface'

// ── 预设标签（分组） ────────────────────────────────────────────────
const PRESET_TAG_GROUPS = [
    {
        group: '景观',
        color: 'arcoblue',
        tags: ['海景', '山景', '城景', '园景', '泳池景', '高楼层'],
    },
    {
        group: '设施',
        color: 'green',
        tags: ['带阳台', '带浴缸', '独立淋浴', '小厨房', '免费WiFi', '独立书房'],
    },
    {
        group: '房间特色',
        color: 'purple',
        tags: ['套房', '复式/Loft', '转角房', '顶层', '行政楼层'],
    },
    {
        group: '适用人群',
        color: 'orangered',
        tags: ['亲子房', '蜜月/情侣', '商务出行', '无障碍', '宠物友好'],
    },
    {
        group: '政策',
        color: 'gold',
        tags: ['含早餐', '禁烟', '可吸烟', '免费停车', '含接送机'],
    },
];

function getTagColor(name: string): string {
    for (const group of PRESET_TAG_GROUPS) {
        if (group.tags.includes(name)) return group.color;
    }
    return 'cyan';
}

// ── Props ──────────────────────────────────────────────────────────
interface RoomTagSelectorProps {
    value?: string[];
    onChange?: (tags: string[]) => void;
}

export default function RoomTagSelector({ value = [], onChange }: RoomTagSelectorProps) {
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<RefInputType>(null)

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