import React, { useState } from 'react';
import {
  Server,
  Play,
  Copy,
  Check,
  Send,
  Code2,
  Clock,
  ShieldCheck,
  FileJson,
  Layers,
  Sparkles
} from 'lucide-react';
import { handleApiV1Request } from '../../api/v1Router';
import { ApiResponse } from '../../api/types/apiContracts';

interface ApiRouteDemo {
  method: 'GET' | 'POST';
  path: string;
  category: string;
  description: string;
  headers?: Record<string, string>;
  body?: any;
}

const API_ROUTES: ApiRouteDemo[] = [
  {
    method: 'GET',
    path: '/api/v1/businesses?page=1&limit=3&sortBy=rating&sortOrder=desc',
    category: 'Businesses',
    description: 'Fetch paginated business listings with sorting and meta pagination payload',
  },
  {
    method: 'GET',
    path: '/api/v1/search?lat=-12.8024&lng=28.2132&radius_km=10&q=Hardware',
    category: 'Search & PostGIS',
    description: 'Execute PostGIS spatial radius calculation around Kitwe center for Hardware stores',
  },
  {
    method: 'GET',
    path: '/api/v1/categories',
    category: 'Taxonomy',
    description: 'List primary Bwana commercial categories with merchant count badges',
  },
  {
    method: 'GET',
    path: '/api/v1/locations',
    category: 'Geography',
    description: 'Retrieve hierarchical country markets and multi-tier municipality datasets',
  },
  {
    method: 'POST',
    path: '/api/v1/auth/login',
    category: 'Auth & JWT',
    description: 'Authenticate user with role assignment and receive bearer token',
    body: {
      email: 'm.mumba8@gmail.com',
      role: 'registered_user',
    },
  },
  {
    method: 'GET',
    path: '/api/v1/reviews?businessId=biz-abc-hardware',
    category: 'Reviews',
    description: 'Fetch verified reviews for a specific merchant listing',
  },
  {
    method: 'POST',
    path: '/api/v1/favorites/toggle',
    category: 'Favorites',
    description: 'Save or remove merchant from user favorites (requires authorization)',
    headers: {
      Authorization: 'Bearer bwana_token_registered_user_usr-cust-01',
    },
    body: {
      businessId: 'biz-abc-hardware',
    },
  },
  {
    method: 'POST',
    path: '/api/v1/reports',
    category: 'Moderation',
    description: 'Submit an inaccurate information report for moderator queue',
    body: {
      targetType: 'business',
      targetId: 'biz-abc-hardware',
      reason: 'Updated phone line needed for emergency services',
    },
  },
  {
    method: 'GET',
    path: '/api/v1/admin/stats',
    category: 'Admin & Auditing',
    description: 'Access platform health, verification queue, and metrics (Admin clearance required)',
    headers: {
      Authorization: 'Bearer bwana_token_admin_admin-01',
    },
  },
];

export const ApiConsoleModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [selectedRoute, setSelectedRoute] = useState<ApiRouteDemo>(API_ROUTES[0]);
  const [response, setResponse] = useState<ApiResponse<any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleExecute = async (route: ApiRouteDemo) => {
    setLoading(true);
    try {
      const res = await handleApiV1Request(route.path, {
        method: route.method,
        body: route.body,
        headers: route.headers,
      });
      setResponse(res);
    } catch (err: any) {
      setResponse({
        success: false,
        data: null,
        error: { code: 'EXECUTION_ERROR', message: err?.message || 'Failed' },
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-display text-white">
                  Bwana Interactive API v1 Console
                </h3>
                <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.2 rounded font-semibold">
                  REST v1 Engine
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Test versioned endpoints, pagination, DTO structures, RBAC auth, and rate limits in real-time.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-stone-200">
          {/* Left panel: Endpoints selector */}
          <div className="w-full md:w-80 bg-stone-50 p-3 overflow-y-auto space-y-1.5 shrink-0 text-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 px-2 py-1">
              Select API v1 Endpoint:
            </div>
            {API_ROUTES.map((route) => {
              const isSelected = selectedRoute.path === route.path && selectedRoute.method === route.method;
              return (
                <button
                  key={`${route.method}-${route.path}`}
                  onClick={() => {
                    setSelectedRoute(route);
                    handleExecute(route);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100/80'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 font-mono text-[10px]">
                    <span
                      className={`px-1.5 py-0.2 rounded font-bold ${
                        route.method === 'GET'
                          ? isSelected ? 'bg-emerald-500 text-stone-950' : 'bg-emerald-100 text-emerald-800'
                          : isSelected ? 'bg-blue-400 text-stone-950' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {route.method}
                    </span>
                    <span className="truncate opacity-80">{route.category}</span>
                  </div>
                  <div className="font-mono text-[11px] truncate">{route.path}</div>
                </button>
              );
            })}
          </div>

          {/* Right panel: Request details & Response payload */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 flex flex-col">
            {/* Active Request Bar */}
            <div className="bg-stone-900 text-white p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 truncate">
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    selectedRoute.method === 'GET' ? 'bg-emerald-500 text-stone-950' : 'bg-blue-500 text-white'
                  }`}
                >
                  {selectedRoute.method}
                </span>
                <span className="truncate text-stone-200">{selectedRoute.path}</span>
              </div>
              <button
                onClick={() => handleExecute(selectedRoute)}
                disabled={loading}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{loading ? 'Executing...' : 'Send Request'}</span>
              </button>
            </div>

            <p className="text-xs text-stone-500">
              {selectedRoute.description}
            </p>

            {/* Request Body if applicable */}
            {selectedRoute.body && (
              <div>
                <span className="text-[11px] font-bold uppercase text-stone-500 block mb-1">
                  Request Payload (JSON Body):
                </span>
                <pre className="p-3 bg-stone-100 rounded-xl text-[11px] font-mono text-stone-800 overflow-x-auto border border-stone-200">
                  {JSON.stringify(selectedRoute.body, null, 2)}
                </pre>
              </div>
            )}

            {/* Response Section */}
            <div className="flex-1 flex flex-col min-h-[220px]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase text-stone-500 flex items-center gap-1">
                  <FileJson className="w-3.5 h-3.5 text-emerald-600" />
                  Standardized API Response:
                </span>
                {response && (
                  <button
                    onClick={copyResponse}
                    className="text-[11px] text-stone-500 hover:text-stone-900 flex items-center gap-1 cursor-pointer font-mono"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                )}
              </div>

              <div className="flex-1 p-3.5 bg-stone-950 text-stone-100 rounded-2xl font-mono text-[11px] overflow-auto border border-stone-800 shadow-inner max-h-[300px]">
                {loading ? (
                  <div className="p-6 text-center text-stone-400">Processing REST request through v1Router...</div>
                ) : response ? (
                  <pre className="text-emerald-400">{JSON.stringify(response, null, 2)}</pre>
                ) : (
                  <div className="p-6 text-center text-stone-500">
                    Click "Send Request" to test endpoint response.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
