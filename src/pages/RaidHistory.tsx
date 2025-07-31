import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { raidRunService, raidWingService } from '../database/dbService';
import { RaidRun, RaidWing } from '../database/db';
import { formatDate, formatTime, getDurationDescription } from '../utils/timeUtils';
import { useUser } from '../contexts/UserContext';
import authService from '../database/authService';

const HistoryContainer = styled.div`
  padding: 24px 0;
`;

const HistoryHeader = styled.div`
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

const FiltersContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 200px;
  
  label {
    display: block;
    margin-bottom: 8px;
    color: var(--text-primary);
  }
  
  select {
    width: 100%;
    padding: 12px;
    border-radius: 4px;
    border: 1px solid #444;
    background-color: #2a2a2a;
    color: var(--text-primary);
    font-size: 1rem;
  }
`;

const RunsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const RunCard = styled(Link)<{ $status: string }>`
  background-color: var(--surface);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  text-decoration: none;
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-left: 4px solid ${props => {
    switch (props.$status) {
      case 'completed': return 'var(--success)';
      case 'failed': return 'var(--error)';
      case 'in-progress': return 'var(--secondary)';
      case 'paused': return 'var(--accent)';
      default: return 'transparent';
    }
  }};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const RunHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const RunActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const DeleteButton = styled.button`
  background-color: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: rgba(244, 67, 54, 0.3);
    border-color: rgba(244, 67, 54, 0.5);
  }
`;

const RunTitle = styled.h3`
  font-size: 1.3rem;
  margin: 0;
`;

const RunStatus = styled.div<{ $status: string }>`
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.$status) {
      case 'completed': return 'rgba(76, 175, 80, 0.2)';
      case 'failed': return 'rgba(244, 67, 54, 0.2)';
      case 'in-progress': return 'rgba(33, 150, 243, 0.2)';
      case 'paused': return 'rgba(255, 193, 7, 0.2)';
      default: return 'rgba(158, 158, 158, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'completed': return '#4caf50';
      case 'failed': return '#f44336';
      case 'in-progress': return '#2196f3';
      case 'paused': return '#ffc107';
      default: return '#9e9e9e';
    }
  }};
`;

const RunDate = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const RunTime = styled.div`
  font-family: monospace;
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--primary);
  margin: 8px 0;
`;

const RunDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

const RunDetail = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  
  span:first-child {
    color: var(--text-secondary);
  }
  
  span:last-child {
    font-weight: 500;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
  background-color: var(--surface);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 24px;
    opacity: 0.5;
    color: var(--text-secondary);
  }
  
  h3 {
    margin-bottom: 16px;
    font-size: 1.5rem;
  }
  
  p {
    margin-bottom: 24px;
    color: var(--text-secondary);
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

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  border-radius: 4px;
  background-color: ${props => props.$active ? 'var(--primary)' : 'var(--surface)'};
  color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
  border: 1px solid ${props => props.$active ? 'var(--primary)' : '#444'};
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: ${props => props.$active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)'};
  }
  
  &:disabled {
    background-color: #2a2a2a;
    color: #666;
    cursor: not-allowed;
    border-color: #333;
  }
`;

const getStatusText = (status: string): string => {
  switch (status) {
    case 'completed': return 'Completed';
    case 'failed': return 'Failed';
    case 'in-progress': return 'In Progress';
    case 'paused': return 'Paused';
    default: return 'Unknown';
  }
};

const RaidHistory: React.FC = () => {
  const { user, isLoggedIn } = useUser();
  const [runs, setRuns] = useState<RaidRun[]>([]);
  const [wings, setWings] = useState<RaidWing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [wingFilter, setWingFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [patchFilter, setPatchFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  
  // Patch data
  const [patches, setPatches] = useState<string[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const runsPerPage = 9;
  
  // Delete functionality
  const handleDeleteRun = async (runId: number, event: React.MouseEvent) => {
    event.preventDefault(); // Prevent navigation
    event.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this raid run? This action cannot be undone.')) {
      try {
        await raidRunService.delete(runId);
        
        // Reload data
        const runsData = await raidRunService.getAll();
        setRuns(runsData);
        
        // Recalculate pagination
        const newTotalPages = Math.ceil(runsData.length / runsPerPage);
        setTotalPages(newTotalPages);
        
        // Adjust current page if necessary
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } catch (err) {
        setError('Failed to delete raid run');
        console.error(err);
      }
    }
  };
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load all raid wings
        const wingsData = await raidWingService.getAll();
        setWings(wingsData);
        
        // Load runs based on user login status
        let runsData: RaidRun[] = [];
        
        if (isLoggedIn && user) {
          // Get run IDs linked to the current user
          const userRunIds = await authService.getUserRuns();
          
          // Only load runs that are linked to the current user
          if (userRunIds.length > 0) {
            const allRuns = await raidRunService.getAll();
            runsData = allRuns.filter(run => userRunIds.includes(run.id as number));
          }
        } else {
          // If not logged in, don't show any runs
          runsData = [];
        }
        
        setRuns(runsData);
        
        // Load all patches
        const patchesData = await raidRunService.getAllPatches();
        setPatches(patchesData);
        
        // Calculate total pages
        setTotalPages(Math.ceil(runsData.length / runsPerPage));
      } catch (err) {
        setError('Failed to load raid history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [isLoggedIn, user]);
  
  // Apply filters and sorting
  const filteredRuns = runs.filter(run => {
    // Filter by wing
    if (wingFilter !== 'all' && run.raidWingId !== wingFilter) {
      return false;
    }
    
    // Filter by status
    if (statusFilter !== 'all' && run.status !== statusFilter) {
      return false;
    }
    
    // Filter by patch
    if (patchFilter !== 'all' && run.patch !== patchFilter) {
      return false;
    }
    
    return true;
  });
  
  // Apply sorting
  const sortedRuns = [...filteredRuns].sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      case 'date-desc':
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      case 'time-asc':
        return (a.totalTime || Infinity) - (b.totalTime || Infinity);
      case 'time-desc':
        return (b.totalTime || 0) - (a.totalTime || 0);
      default:
        return 0;
    }
  });
  
  // Get current page runs
  const indexOfLastRun = currentPage * runsPerPage;
  const indexOfFirstRun = indexOfLastRun - runsPerPage;
  const currentRuns = sortedRuns.slice(indexOfFirstRun, indexOfLastRun);
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Get wing name by ID
  const getWingName = (wingId: number): string => {
    const wing = wings.find(w => w.id === wingId);
    return wing ? wing.name : `Wing ${wingId}`;
  };
  
  return (
    <HistoryContainer>
      <HistoryHeader>
        <Title>Raid History</Title>
        <Subtitle>Review and analyze your past raid runs</Subtitle>
      </HistoryHeader>
      
      {error && (
        <div className="text-error mb-4">{error}</div>
      )}
      
      <FiltersContainer>
        <FilterGroup>
          <label htmlFor="wingFilter">Raid Wing</label>
          <select
            id="wingFilter"
            value={wingFilter.toString()}
            onChange={(e) => {
              setWingFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value="all">All Wings</option>
            {wings.map(wing => (
              <option key={wing.id} value={wing.id?.toString()}>
                {wing.name}
              </option>
            ))}
          </select>
        </FilterGroup>
        
        <FilterGroup>
          <label htmlFor="statusFilter">Status</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="in-progress">In Progress</option>
            <option value="paused">Paused</option>
          </select>
        </FilterGroup>
        
        <FilterGroup>
          <label htmlFor="patchFilter">Patch</label>
          <select
            id="patchFilter"
            value={patchFilter}
            onChange={(e) => {
              setPatchFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Patches</option>
            {patches.map(patch => (
              <option key={patch} value={patch}>
                {patch}
              </option>
            ))}
          </select>
        </FilterGroup>
        
        <FilterGroup>
          <label htmlFor="sortBy">Sort By</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="time-asc">Time (Fastest First)</option>
            <option value="time-desc">Time (Slowest First)</option>
          </select>
        </FilterGroup>
      </FiltersContainer>
      
      {loading ? (
        <LoadingState>
          Loading raid history...
        </LoadingState>
      ) : currentRuns.length > 0 ? (
        <>
          <RunsGrid>
            {currentRuns.map(run => (
              <RunCard key={run.id} to={`/history/${run.id}`} $status={run.status}>
                <RunHeader>
                  <RunTitle>{getWingName(run.raidWingId)}</RunTitle>
                  <RunActions>
                    <RunStatus $status={run.status}>
                      {getStatusText(run.status)}
                    </RunStatus>
                    <DeleteButton
                      onClick={(e) => handleDeleteRun(run.id as number, e)}
                      title="Delete this run"
                    >
                      ✕
                    </DeleteButton>
                  </RunActions>
                </RunHeader>
                
                <RunDate>{formatDate(new Date(run.startTime))}</RunDate>
                
                <RunTime>
                  {run.totalTime ? formatTime(run.totalTime) : 'In Progress'}
                </RunTime>
                
                <RunDetails>
                  <RunDetail>
                    <span>Duration:</span>
                    <span>
                      {run.totalTime
                        ? getDurationDescription(run.totalTime)
                        : 'In Progress'}
                    </span>
                  </RunDetail>
                  
                  <RunDetail>
                    <span>Deaths:</span>
                    <span>{run.deaths.length}</span>
                  </RunDetail>
                  
                  <RunDetail>
                    <span>Steps Completed:</span>
                    <span>{run.steps.length}</span>
                  </RunDetail>
                  
                  {run.patch && (
                    <RunDetail>
                      <span>Patch:</span>
                      <span>{run.patch}</span>
                    </RunDetail>
                  )}
                </RunDetails>
              </RunCard>
            ))}
          </RunsGrid>
          
          {totalPages > 1 && (
            <Pagination>
              <PageButton
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </PageButton>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <PageButton
                  key={number}
                  onClick={() => paginate(number)}
                  $active={currentPage === number}
                >
                  {number}
                </PageButton>
              ))}
              
              <PageButton
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </PageButton>
            </Pagination>
          )}
        </>
      ) : (
        <EmptyState>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M13,2.03V2.05L13,4.05C17.39,4.59 20.5,8.58 19.96,12.97C19.5,16.61 16.64,19.5 13,19.93V21.93C18.5,21.38 22.5,16.5 21.95,11C21.5,6.25 17.73,2.5 13,2.03M11,2.06C9.05,2.25 7.19,3 5.67,4.26L7.1,5.74C8.22,4.84 9.57,4.26 11,4.06V2.06M4.26,5.67C3,7.19 2.25,9.04 2.05,11H4.05C4.24,9.58 4.8,8.23 5.69,7.1L4.26,5.67M2.06,13C2.26,14.96 3.03,16.81 4.27,18.33L5.69,16.9C4.81,15.77 4.24,14.42 4.06,13H2.06M7.1,18.37L5.67,19.74C7.18,21 9.04,21.79 11,22V20C9.58,19.82 8.23,19.25 7.1,18.37M16.82,15.19L12.71,11.08C13.12,10.04 12.89,8.82 12.03,7.97C11.13,7.06 9.78,6.88 8.69,7.38L10.63,9.32L9.28,10.68L7.29,8.73C6.75,9.82 7,11.17 7.88,12.08C8.74,12.94 9.96,13.16 11,12.76L15.11,16.86C15.29,17.05 15.56,17.05 15.74,16.86L16.78,15.83C17,15.65 17,15.33 16.82,15.19Z" />
          </svg>
          <h3>No Raid Runs Found</h3>
          <p>
            {!isLoggedIn
              ? 'You need to log in to view your raid history.'
              : filteredRuns.length === 0 && runs.length > 0
                ? 'No runs match your current filters. Try adjusting your filters to see more results.'
                : 'You haven\'t recorded any raid runs yet. Start tracking your raids to build your history.'}
          </p>
          {isLoggedIn ? (
            <Link to="/tracker">
              <button>Start a New Run</button>
            </Link>
          ) : (
            <Link to="/">
              <button>Go to Dashboard</button>
            </Link>
          )}
        </EmptyState>
      )}
    </HistoryContainer>
  );
};

export default RaidHistory;