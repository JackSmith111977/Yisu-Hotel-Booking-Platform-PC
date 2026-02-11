import { useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
import { Card } from '@arco-design/web-react';

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

  const filteredData = useMemo(() => data.filter(item => item.count > 0), [data]);

  const total = useMemo(() => filteredData.reduce((sum, item) => sum + item.count, 0), [filteredData]);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        // 使用过滤后的数据
        data: filteredData.map(item => item.status),
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
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}: {c}',
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
            fill: '#86909C',
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
            fill: '#1D2129',
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
  }, [filteredData, total]);

  return (
    <Card title={title} style={{ width: '100%', maxWidth: 500 }}>
      <div ref={chartRef} style={{ width: '100%', height }} />
    </Card>
  );
};

export default StatusEChart;