import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { raidWingService, analyticsService } from '../database/dbService';
import { RaidWing } from '../database/db';
import { formatTime, getDurationDescription } from '../utils/timeUtils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsContainer = styled.div`
  padding: 24px 0;
`;

const AnalyticsHeader = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 8px;
  color: var(--text-primary);
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-bottom: 24px;
`;

const WingSelector = styled.div`
  margin-bottom: 32px;
  
  label {
    display: block;
    margin-bottom: 8px;
    color: var(--text-primary);
  }
  
  select {
    width: 100%;
    max-width: 400px;
    padding: 12px;
    border-radius: 4px;
    border: 1px solid #444;
    background-color: #2a2a2a;
    color: var(--text-primary);
    font-size: 1rem;
  }
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const AnalyticsCard = styled.div`
  background-color: var(--surface);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 16px;
  color: var(--text-primary);
`;

const ChartContainer = styled.div`
  height: 300px;
  position: relative;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--primary);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
  color: var(--text-secondary);
  
  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 24px;
    opacity: 0.5;
  }
  
  h3 {
    margin-bottom: 16px;
    font-size: 1.5rem;
  }
  
  p {
    margin-bottom: 16px;
  }
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48px;
  font-size: 1.2rem;
  color: var(--text-secondary);
`;

interface ProgressData {
  date: string;
  time: number;
}

interface DeathHotspot {
  location: string;
  count: number;
}

interface StepTiming {
  stepId: number;
  time: number;
}

const RaidAnalytics: React.FC = () => {
  const [wings, setWings] = useState<RaidWing[]>([]);
  const [selectedWingId, setSelectedWingId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Analytics data
  const [averageTime, setAverageTime] = useState<number | null>(null);
  const [successRate, setSuccessRate] = useState<number | null>(null);
  const [averageDeaths, setAverageDeaths] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [deathHotspots, setDeathHotspots] = useState<DeathHotspot[]>([]);
  
  // Load wings on mount
  useEffect(() => {
    const loadWings = async () => {
      try {
        const wingsData = await raidWingService.getAll();
        setWings(wingsData);
        
        if (wingsData.length > 0) {
          setSelectedWingId(wingsData[0].id || null);
        }
      } catch (err) {
        setError('Failed to load raid wings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadWings();
  }, []);
  
  // Load analytics data when wing changes
  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!selectedWingId) return;
      
      setLoading(true);
      try {
        // Get average run time
        const avgTime = await analyticsService.getAverageRunTime(selectedWingId);
        setAverageTime(avgTime);
        
        // Get success rate
        const success = await analyticsService.getSuccessRate(selectedWingId);
        setSuccessRate(success);
        
        // Get average deaths per run
        const avgDeaths = await analyticsService.getAverageDeathsPerRun(selectedWingId);
        setAverageDeaths(avgDeaths);
        
        // Get progress over time
        const progress = await analyticsService.getProgressOverTime(selectedWingId);
        setProgressData(progress);
        
        // Calculate best time
        if (progress.length > 0) {
          const times = progress.map(p => p.time);
          setBestTime(Math.min(...times));
        }
        
        // Get death hotspots
        const hotspots = await analyticsService.getDeathHotspots(selectedWingId);
        const hotspotArray = Object.entries(hotspots).map(([location, count]) => ({
          location,
          count
        }));
        setDeathHotspots(hotspotArray);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadAnalyticsData();
  }, [selectedWingId]);
  
  // Prepare chart data for progress over time
  const progressChartData = {
    labels: progressData.map(data => data.date),
    datasets: [
      {
        label: 'Completion Time',
        data: progressData.map(data => data.time / 1000 / 60), // Convert to minutes
        borderColor: '#c02c38',
        backgroundColor: 'rgba(192, 44, 56, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };
  
  const progressChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Time (minutes)',
          color: '#f5f5f5',
        },
        ticks: {
          color: '#b0b0b0',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#b0b0b0',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#f5f5f5',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const minutes = context.raw;
            const minutesInt = Math.floor(minutes);
            const seconds = Math.round((minutes - minutesInt) * 60);
            return `${minutesInt}m ${seconds}s`;
          },
        },
      },
    },
  };
  
  // Prepare chart data for death hotspots
  const deathHotspotsChartData = {
    labels: deathHotspots.map(spot => spot.location),
    datasets: [
      {
        label: 'Deaths',
        data: deathHotspots.map(spot => spot.count),
        backgroundColor: [
          'rgba(192, 44, 56, 0.7)',
          'rgba(44, 135, 192, 0.7)',
          'rgba(192, 144, 44, 0.7)',
          'rgba(76, 175, 80, 0.7)',
          'rgba(156, 39, 176, 0.7)',
        ],
        borderColor: [
          '#c02c38',
          '#2c87c0',
          '#c0902c',
          '#4caf50',
          '#9c27b0',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const deathHotspotsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#f5f5f5',
        },
      },
    },
  };
  
  return (
    <AnalyticsContainer>
      <AnalyticsHeader>
        <Title>Raid Analytics</Title>
        <Subtitle>Analyze your raid performance data</Subtitle>
      </AnalyticsHeader>
      
      {error && (
        <div className="text-error mb-4">{error}</div>
      )}
      
      <WingSelector>
        <label htmlFor="wingSelector">Select Raid Wing</label>
        <select
          id="wingSelector"
          value={selectedWingId?.toString() || ''}
          onChange={(e) => setSelectedWingId(parseInt(e.target.value))}
          disabled={loading || wings.length === 0}
        >
          {wings.map(wing => (
            <option key={wing.id} value={wing.id?.toString()}>
              {wing.name}
            </option>
          ))}
        </select>
      </WingSelector>
      
      {loading ? (
        <LoadingState>
          Loading analytics data...
        </LoadingState>
      ) : progressData.length > 0 ? (
        <>
          <StatsGrid>
            <StatCard>
              <StatLabel>Average Completion Time</StatLabel>
              <StatValue>
                {averageTime ? formatTime(averageTime) : 'N/A'}
              </StatValue>
            </StatCard>
            
            <StatCard>
              <StatLabel>Best Completion Time</StatLabel>
              <StatValue>
                {bestTime ? formatTime(bestTime) : 'N/A'}
              </StatValue>
            </StatCard>
            
            <StatCard>
              <StatLabel>Success Rate</StatLabel>
              <StatValue>
                {successRate !== null ? `${Math.round(successRate)}%` : 'N/A'}
              </StatValue>
            </StatCard>
            
            <StatCard>
              <StatLabel>Average Deaths Per Run</StatLabel>
              <StatValue>
                {averageDeaths !== null ? averageDeaths.toFixed(1) : 'N/A'}
              </StatValue>
            </StatCard>
          </StatsGrid>
          
          <AnalyticsGrid>
            <AnalyticsCard>
              <CardTitle>Progress Over Time</CardTitle>
              <ChartContainer>
                <Line data={progressChartData} options={progressChartOptions} />
              </ChartContainer>
            </AnalyticsCard>
            
            <AnalyticsCard>
              <CardTitle>Death Hotspots</CardTitle>
              {deathHotspots.length > 0 ? (
                <ChartContainer>
                  <Pie data={deathHotspotsChartData} options={deathHotspotsChartOptions} />
                </ChartContainer>
              ) : (
                <div className="text-center mt-4">
                  <p>No death data available for this wing.</p>
                </div>
              )}
            </AnalyticsCard>
          </AnalyticsGrid>
        </>
      ) : (
        <EmptyState>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.9 20.1,3 19,3M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17Z" />
          </svg>
          <h3>No Analytics Data Available</h3>
          <p>
            {wings.length > 0
              ? 'Complete some raid runs to generate analytics data.'
              : 'No raid wings found. Please check your database setup.'}
          </p>
        </EmptyState>
      )}
    </AnalyticsContainer>
  );
};

export default RaidAnalytics;