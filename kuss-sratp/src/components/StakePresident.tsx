import { useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/api';

// Use flexible shapes since backend payload can vary
interface StakeReportItem { [key: string]: any }

const StakePresident: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'wards' | 'reports'>('overview');
  const [wardFilter, setWardFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [reports, setReports] = useState<StakeReportItem[]>([]);
  const ALL_WARDS = useMemo(() => [
    'Abayita', 'Entebbe', 'Kabowa', 'Kajjansi1', 'Kajjansi2',
    'Kansanga', 'Kibiri', 'Kyengera', 'Makindye', 'Mengo',
    'Nansana', 'Nsambya'
  ].sort(), []);

  // Helpers to safely extract display strings from possibly nested objects
  const getWardName = (r: StakeReportItem): string => {
    const direct = r.wardname || r.ward_name || r.ward || r.wardName;
    if (typeof direct === 'string' && direct.trim()) return direct.trim();
    if (direct && typeof direct === 'object') {
      const nested = direct.wardname || direct.ward_name || direct.name || direct.title;
      if (typeof nested === 'string' && nested.trim()) return nested.trim();
    }
    return 'Ward';
  };

  const getGroupName = (r: StakeReportItem): string => {
    const candidate = r.groupname || r.group_name || r.group || r.groupName;
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    if (candidate && typeof candidate === 'object') {
      const nested = candidate.groupname || candidate.group_name || candidate.name || candidate.groupdescription || candidate.title;
      if (typeof nested === 'string' && nested.trim()) return nested.trim();
    }
    return 'Group';
  };

  // Fetch stake reports
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await apiService.getStakeReports();
        setReports(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load stake reports');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Extract ward and group names defensively
  const wardOptions = ALL_WARDS;

  const groupOptions = useMemo(() => {
    const names = new Set<string>();
    reports.forEach(r => names.add(getGroupName(r)));
    return Array.from(names).sort();
  }, [reports]);

  // Apply filters
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const wardName = getWardName(r);
      const groupName = getGroupName(r);
      if (wardFilter !== 'all' && wardName !== wardFilter) return false;
      if (groupFilter !== 'all' && groupName !== groupFilter) return false;
      return true;
    });
  }, [reports, wardFilter, groupFilter]);

  // Compute simple KPI summaries
  const summary = useMemo(() => {
    const totalGroups = new Set<string>();
    let totalParticipants = 0;
    let progressValues: number[] = [];
    filteredReports.forEach(r => {
      const gid = (r.groupid || r.group_id || r.groupId || r.groupname || r.group_name || r.group || '').toString();
      if (gid) totalGroups.add(gid);
      const participants = Number(r.totalparticipants || r.participants || r.totalParticipants || 0);
      if (!Number.isNaN(participants)) totalParticipants += participants;
      const progress = Number(r.progress || r.averageprogress || r.averageProgress || r.completion || 0);
      if (!Number.isNaN(progress) && progress > 0) progressValues.push(Math.min(100, Math.max(0, progress)));
    });
    const averageProgress = progressValues.length
      ? Math.round(progressValues.reduce((a, b) => a + b, 0) / progressValues.length)
      : 0;
    return {
      totalGroups: totalGroups.size,
      totalParticipants,
      averageProgress,
    };
  }, [filteredReports]);

  const safePercent = (n: number) => `${Math.max(0, Math.min(100, n))}%`;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-teal-200 shadow-teal-100">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Stake President Dashboard</h1>
          <p className="text-gray-600 text-lg">Monitor stake-wide reports and progress</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8">
          {[
            { id: 'overview', label: 'Stake Overview' },
            { id: 'wards', label: 'Group Progress' },
            { id: 'reports', label: 'Raw Reports' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stake Performance Summary */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Overall Stake Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600">{wardOptions.length}</div>
                  <div className="text-gray-600">Wards/Branches</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600">{groupOptions.length}</div>
                  <div className="text-gray-600">Groups</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600">{summary.totalGroups}</div>
                  <div className="text-gray-600">Unique Group IDs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600">{summary.totalParticipants}</div>
                  <div className="text-gray-600">Total Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600">{summary.averageProgress}%</div>
                  <div className="text-gray-600">Average Progress</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-teal-600 mb-2">{summary.averageProgress}%</div>
                  <div className="text-gray-600">Average Stake Progress</div>
                </div>
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <div className="text-xl font-semibold text-green-800 mb-2">Reports Loaded</div>
                  <div className="text-2xl font-bold text-green-600">{filteredReports.length}</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-6 text-center">
                  <div className="text-xl font-semibold text-yellow-800 mb-2">Filters</div>
                  <div className="text-sm text-yellow-700">Ward: {wardFilter === 'all' ? 'All' : wardFilter} • Group: {groupFilter === 'all' ? 'All' : groupFilter}</div>
                </div>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Ward Progress Overview</h3>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <select
                  value={wardFilter}
                  onChange={(e) => setWardFilter(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                >
                  <option value="all">All Wards/Branches</option>
                  {wardOptions.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                >
                  <option value="all">All Groups</option>
                  {groupOptions.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
              )}
              {isLoading ? (
                <div className="text-center text-gray-600">Loading stake reports...</div>
              ) : (
                <div className="space-y-4">
                  {filteredReports.map((r, idx) => {
                    const wardName = getWardName(r);
                    const groupName = getGroupName(r);
                    const participants = Number(r.totalparticipants || r.participants || r.totalParticipants || 0) || 0;
                    const progress = Number(r.progress || r.averageprogress || r.averageProgress || r.completion || 0) || 0;
                    return (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-48 font-medium text-gray-800">{wardName}</div>
                          <div className="w-64 text-sm text-gray-600 truncate">{groupName}</div>
                          <div className="w-28 text-sm text-gray-600">{participants} participants</div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-40">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: safePercent(progress) }}
                              ></div>
                            </div>
                          </div>
                          <div className="w-16 text-right font-semibold text-teal-600">{Math.round(progress)}%</div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredReports.length === 0 && (
                    <div className="text-center text-gray-500">No reports match the selected filters.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'wards' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Group Progress Detail</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((r, idx) => {
                const wardName = getWardName(r);
                const groupName = getGroupName(r);
                const participants = Number(r.totalparticipants || r.participants || r.totalParticipants || 0) || 0;
                const progress = Number(r.progress || r.averageprogress || r.averageProgress || r.completion || 0) || 0;
                const updated = (r.updated_at || r.lastReportDate || r.updatedAt || '').toString().split('T')[0] || '—';
                return (
                  <div key={idx} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">{wardName}</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Group</span>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Group:</span>
                        <span className="font-medium text-gray-800 truncate max-w-[60%]">{groupName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Participants:</span>
                        <span className="font-medium text-gray-800">{participants}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Progress:</span>
                        <span className="font-medium text-teal-600">{Math.round(progress)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Update:</span>
                        <span className="font-medium text-gray-800">{updated}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: safePercent(progress) }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredReports.length === 0 && (
                <div className="text-center text-gray-500 col-span-full">No data to display.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Raw Stake Reports</h2>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}
            {isLoading ? (
              <div className="text-center text-gray-600">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ward</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReports.map((r, idx) => {
                      const wardName = getWardName(r);
                      const groupName = getGroupName(r);
                      const participants = Number(r.totalparticipants || r.participants || r.totalParticipants || 0) || 0;
                      const progress = Number(r.progress || r.averageprogress || r.averageProgress || r.completion || 0) || 0;
                      return (
                        <tr key={idx}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{wardName}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{groupName}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{participants}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{Math.round(progress)}%</td>
                        </tr>
                      );
                    })}
                    {filteredReports.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-gray-500">No reports available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StakePresident;
