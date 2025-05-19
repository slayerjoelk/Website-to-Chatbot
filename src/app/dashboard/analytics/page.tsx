import { Card, Title, AreaChart, DonutChart, Grid } from '@tremor/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const chartdata = [
  {
    date: '2023-05-01',
    Conversations: 2890,
    'Response Rate': 98,
    'User Satisfaction': 95,
  },
  // Add more data points as needed
];

const donutData = [
  { name: 'Product Questions', value: 456 },
  { name: 'Support Issues', value: 351 },
  { name: 'Feature Requests', value: 271 },
  { name: 'General Inquiries', value: 191 },
];

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>

        <Grid numItemsLg={2} className="mt-6 gap-6">
          <Card>
            <Title>Conversation Metrics</Title>
            <AreaChart
              className="mt-4 h-72"
              data={chartdata}
              index="date"
              categories={['Conversations', 'Response Rate', 'User Satisfaction']}
              colors={['blue', 'cyan', 'indigo']}
            />
          </Card>

          <Card>
            <Title>Conversation Types</Title>
            <DonutChart
              className="mt-6"
              data={donutData}
              category="value"
              index="name"
              colors={['blue', 'cyan', 'indigo', 'violet']}
            />
          </Card>
        </Grid>
      </div>
    </DashboardLayout>
  );
}