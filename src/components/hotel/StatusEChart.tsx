import { useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
import { Card } from '@arco-design/web-react';
import { useThemeStore } from '@/store/useThemeStore';

export interface StatusData {
  status: string;
  count: number;
}

interface StatusPieChartProps {
  data: StatusData[];
  statusColorMap: Record<string, string>;
  title: string;  
  height?: number;
}

const StatusEChart = ({ data, title, statusColorMap, height = 350 }: StatusPieChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const theme = useThemeStore((state) => state.theme);

  const filteredData = useMemo(() => data.filter(item => item.count > 0), [data]);
  const total = useMemo(() => filteredData.reduce((sum, item) => sum + item.count, 0), [filteredData]);

  useEffect(() => {
    if (!chartRef.current) return;

    const isDark = theme === 'dark';
    const textColor = isDark ? '#e5e7eb' : '#1D2129';
    const subTextColor = isDark ? '#9ca3af' : '#86909C';
    const legendTextColor = isDark ? '#d1d5db' : '#4e5969';

    // 销毁旧实例，避免主题切换时残留
    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    chartInstance.current = echarts.init(chartRef.current);

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        data: filteredData.map(item => item.status),
        textStyle: {
          color: legendTextColor,
        },
      },
      series: [
        {
          name: '状态分布',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 4,
            borderColor: isDark ? '#1f2937' : '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}: {c}',
            color: textColor,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
          data: filteredData.map(item => ({
            name: item.status,
            value: item.count,
            itemStyle: {
              color: statusColorMap[item.status] || '#165DFF',
            },
          })),
        },
      ],
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '38%',
          style: {
            text: '总计',
            fontSize: 14,
            fill: subTextColor,
          },
        },
        {
          type: 'text',
          left: 'center',
          top: '46%',
          style: {
            text: String(total),
            fontSize: 24,
            fontWeight: 'bold',
            fill: textColor,
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [filteredData, total, theme]);

  return (
    <Card title={title} style={{ width: '100%', maxWidth: 500 }}>
      <div ref={chartRef} style={{ width: '100%', height }} />
    </Card>
  );
};

export default StatusEChart;