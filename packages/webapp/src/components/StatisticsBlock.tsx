import { SimpleGrid, Stack, Text, Loader, Alert, Title as MantineTitle } from '@mantine/core';
import {
  useModelCounts,
  useUserCreationCounts,
  useUserExamQuestionCreationCounts,
  CreationCountsResponse
} from '../api/statistics';
import { useCountAnimation } from '../pages/mobile/exercise/SubjectsPicker';
import { Bar } from 'react-chartjs-2';
import React, { memo, useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartJsTitle,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartJsTitle,
  Tooltip,
  Legend
);

export const StatisticsBlock = memo(() => {
  const { data: statisticsData, isLoading: isLoadingStatistics, error: errorStatistics } = useModelCounts();
  const { data: userCreationData, isLoading: isLoadingUserCreation, error: errorUserCreation } = useUserCreationCounts();
  const { data: userExamQuestionCreationData, isLoading: isLoadingUserExamQuestionCreation, error: errorUserExamQuestionCreation } = useUserExamQuestionCreationCounts();

  // State for resolved Mantine colors
  const [userChartColor, setUserChartColor] = useState('rgba(75, 192, 192, 1)'); // Fallback color
  const [examQuestionChartColor, setExamQuestionChartColor] = useState('rgba(255, 99, 132, 1)'); // Fallback color

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const computedStyles = getComputedStyle(document.documentElement);
      const blue6 = computedStyles.getPropertyValue('--mantine-color-blue-6').trim();
      const red6 = computedStyles.getPropertyValue('--mantine-color-green-6').trim();

      if (blue6) setUserChartColor(blue6);
      if (red6) setExamQuestionChartColor(red6);
    }
  }, []);

  const usersWithSub = useCountAnimation(statisticsData?.nonAdminUsersWithActiveSubscription || 0);
  const usersWithoutSub = useCountAnimation(statisticsData?.nonAdminUsersWithoutActiveSubscription || 0);
  const questionsWithExamId = useCountAnimation(statisticsData?.userExamQuestionsWithExamId || 0);
  const questionsWithoutExamId = useCountAnimation(statisticsData?.userExamQuestionsWithoutExamId || 0);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: 'top' as const,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        grid: {
          display: true,
          drawBorder: false,
        },
      },
    },
  };

  const prepareChartJsData = (apiData: CreationCountsResponse | undefined, label: string, backgroundColor: string) => {
    if (!apiData || Object.keys(apiData).length === 0) {
      return { labels: [], datasets: [] };
    }
    const labels = Object.keys(apiData).sort();
    const dataValues = labels.map(dateLabel => apiData[dateLabel]);
    return {
      labels,
      datasets: [
        {
          label,
          data: dataValues,
          backgroundColor,
          borderRadius: {
            topLeft: 10,
            topRight: 10,
            bottomLeft: 0,
            bottomRight: 0,
          },
          borderSkipped: false,
        },
      ],
    };
  };

  const userCreationChartData = useMemo(() => {
    return prepareChartJsData(userCreationData, 'משתמשים חדשים', userChartColor);
  }, [userCreationData, userChartColor]);

  const userExamQuestionCreationChartData = useMemo(() => {
    return prepareChartJsData(userExamQuestionCreationData, 'שאלות שענו', examQuestionChartColor);
  }, [userExamQuestionCreationData, examQuestionChartColor]);

  const chartContainerStyle = {
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	height: '200px',
  };

  return (
    <>
      <MantineTitle order={3} mb="md">סטטיסטיקות מערכת</MantineTitle>
      {isLoadingStatistics && <Loader />}
      {errorStatistics && (
        <Alert color="red" title="שגיאה בטעינת סטטיסטיקות">
          {(errorStatistics as any)?.message || 'אירעה שגיאה בעת טעינת הנתונים.'}
        </Alert>
      )}
      {statisticsData && !isLoadingStatistics && !errorStatistics && (
        <SimpleGrid cols={{ base: 2, sm: 2, md: 4 }} spacing="lg" mb="xl">
          <Stack align="center" gap="xs">
            <Text size="xl" fw={700}>{usersWithSub}</Text>
            <Text size="sm" c="dimmed" ta="center">מנויים</Text>
          </Stack>
          <Stack align="center" gap="xs">
            <Text size="xl" fw={700}>{usersWithoutSub}</Text>
            <Text size="sm" c="dimmed" ta="center">לא מנויים</Text>
          </Stack>
          <Stack align="center" gap="xs">
            <Text size="xl" fw={700}>{questionsWithExamId}</Text>
            <Text size="sm" c="dimmed" ta="center">שאלות ממבחנים</Text>
          </Stack>
          <Stack align="center" gap="xs">
            <Text size="xl" fw={700}>{questionsWithoutExamId}</Text>
            <Text size="sm" c="dimmed" ta="center">שאלות מתרגולים</Text>
          </Stack>
        </SimpleGrid>
      )}

      {/* User Creation Chart */}
      <MantineTitle order={4} mt="xl" mb="md">משתמשים חדשים</MantineTitle>
      {isLoadingUserCreation && <Loader />}
      {errorUserCreation && (
        <Alert color="red" title="שגיאה בטעינת נתוני יצירת משתמשים">
          {(errorUserCreation as any)?.message || 'אירעה שגיאה בעת טעינת הנתונים.'}
        </Alert>
      )}
      {userCreationData && !isLoadingUserCreation && !errorUserCreation && (
        userCreationChartData.datasets.length > 0 && userCreationChartData.datasets[0].data.length > 0 ? (
          <div style={chartContainerStyle}>
            <Bar options={chartOptions} data={userCreationChartData} />
          </div>
        ) : (
          <Text>אין נתונים להצגה עבור יצירת משתמשים.</Text>
        )
      )}
      
      {/* User Exam Question Creation Chart */}
      <MantineTitle order={4} mt="xl" mb="md">שאלות שנענו</MantineTitle>
      {isLoadingUserExamQuestionCreation && <Loader />}
      {errorUserExamQuestionCreation && (
        <Alert color="red" title="שגיאה בטעינת נתוני יצירת שאלות">
          {(errorUserExamQuestionCreation as any)?.message || 'אירעה שגיאה בעת טעינת הנתונים.'}
        </Alert>
      )}
      {userExamQuestionCreationData && !isLoadingUserExamQuestionCreation && !errorUserExamQuestionCreation && (
        userExamQuestionCreationChartData.datasets.length > 0 && userExamQuestionCreationChartData.datasets[0].data.length > 0 ? (
          <div style={chartContainerStyle}>
            <Bar options={chartOptions} data={userExamQuestionCreationChartData} />
          </div>
        ) : (
          <Text>אין נתונים להצגה עבור יצירת שאלות מתרגולים.</Text>
        )
      )}
    </>
  );
}); 