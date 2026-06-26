import React, { useState } from 'react';

interface MockUser {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
  joinedAt: string;
  accountCount: number;
  cardCount: number;
}

const MOCK_USERS: MockUser[] = [
  { id: 'usr-001', username: 'ivan.petrov', email: 'ivan@example.com', role: 'USER', joinedAt: '2024-01-15', accountCount: 2, cardCount: 3 },
  { id: 'usr-002', username: 'maria.georgieva', email: 'maria@example.com', role: 'USER', joinedAt: '2024-02-20', accountCount: 1, cardCount: 1 },
  { id: 'usr-003', username: 'stefan.dimitrov', email: 'stefan@example.com', role: 'STAFF', joinedAt: '2023-11-01', accountCount: 3, cardCount: 2 },
  { id: 'usr-004', username: 'admin', email: 'admin@bub.bg', role: 'ADMIN', joinedAt: '2023-01-01', accountCount: 1, cardCount: 1 },
];

const ROLE_COLORS: Record<string, { bg: string; fg: string }> = {
  USER: { bg: '#EFEDE6', fg: '#5C6470' },
  STAFF: { bg: '#FBF1E2', fg: '#B5781E' },
  ADMIN: { bg: '#FBEDEB', fg: '#A8362F' },
};

function RoleBadge({ role }: { role: string }) {
  const c = ROLE_COLORS[role] || { bg: '#EFEDE6', fg: '#5C6470' };
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded font-semibold tracking-wider"
      style={{ backgroundColor: c.bg, color: c.fg, fontFamily: '"Geist Mono", monospace' }}
    >
      {role}
    </span>
  );
}

export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);

  const filtered = MOCK_USERS.filter(u => {
    const matchesSearch = !search || u.username.includes(search) || u.email.includes(search);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="animate-bub-fade">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[10px] px-2 py-1 rounded font-semibold tracking-wider" style={{ backgroundColor: '#FBF1E2', color: '#B5781E', fontFamily: '"Geist Mono", monospace' }}>
          ADMIN / STAFF
        </span>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#8A8F99' }} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6.5" cy="6.5" r="4.5" /><line x1="10" y1="10" x2="14" y2="14" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none"
            style={{ borderColor: '#E5E2D9', backgroundColor: '#fff', color: '#14181F', fontFamily: 'Geist, sans-serif' }}
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'USER', 'STAFF', 'ADMIN'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className="px-3 py-2 rounded-lg text-xs font-medium border"
              style={{
                borderColor: roleFilter === role ? '#0F2A47' : '#E5E2D9',
                backgroundColor: roleFilter === role ? '#0F2A47' : '#fff',
                color: roleFilter === role ? '#fff' : '#5C6470',
                fontFamily: '"Geist Mono", monospace',
              }}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* User list */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.map(user => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className="flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors hover:border-[#C8A878]"
              style={{
                backgroundColor: '#fff',
                borderColor: selectedUser?.id === user.id ? '#0F2A47' : '#E5E2D9',
              }}
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                style={{
                  backgroundColor: user.role === 'ADMIN' ? '#0F2A47' : user.role === 'STAFF' ? '#C8A878' : '#F4F2EC',
                  color: user.role === 'ADMIN' ? '#C8A878' : user.role === 'STAFF' ? '#0F2A47' : '#5C6470',
                  fontFamily: 'Geist, sans-serif',
                }}
              >
                {user.username.substring(0, 2).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold" style={{ color: '#14181F', fontFamily: 'Geist, sans-serif' }}>
                    {user.username}
                  </p>
                  <RoleBadge role={user.role} />
                </div>
                <p className="text-xs" style={{ color: '#8A8F99', fontFamily: 'Geist, sans-serif' }}>
                  {user.email} · Joined {user.joinedAt}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-xs" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
                  {user.accountCount} accts · {user.cardCount} cards
                </p>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {user.role !== 'ADMIN' && (
                  <button
                    onClick={e => e.stopPropagation()}
                    className="text-xs px-2.5 py-1.5 rounded-lg border"
                    style={{ borderColor: '#E5E2D9', color: '#5C6470', fontFamily: 'Geist, sans-serif' }}
                  >
                    {user.role === 'STAFF' ? 'Demote' : 'Promote'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          {selectedUser ? (
            <div className="rounded-xl border p-5 sticky top-6" style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}>
              <div className="flex items-center gap-3 mb-5 pb-5 border-b" style={{ borderColor: '#EFEDE6' }}>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold"
                  style={{
                    backgroundColor: selectedUser.role === 'ADMIN' ? '#0F2A47' : selectedUser.role === 'STAFF' ? '#C8A878' : '#F4F2EC',
                    color: selectedUser.role === 'ADMIN' ? '#C8A878' : selectedUser.role === 'STAFF' ? '#0F2A47' : '#5C6470',
                    fontFamily: 'Geist, sans-serif',
                  }}
                >
                  {selectedUser.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-base font-semibold" style={{ fontFamily: 'Fraunces, serif', color: '#14181F' }}>
                    {selectedUser.username}
                  </p>
                  <RoleBadge role={selectedUser.role} />
                </div>
              </div>

              <div className="space-y-2 mb-5">
                {[
                  { label: 'User ID', value: selectedUser.id, mono: true },
                  { label: 'Email', value: selectedUser.email[0] + '***@' + selectedUser.email.split('@')[1] },
                  { label: 'Joined', value: selectedUser.joinedAt },
                  { label: 'Accounts', value: String(selectedUser.accountCount) },
                  { label: 'Cards', value: String(selectedUser.cardCount) },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-2 border-b" style={{ borderColor: '#EFEDE6' }}>
                    <span className="text-xs" style={{ color: '#8A8F99', fontFamily: 'Geist, sans-serif' }}>{row.label}</span>
                    <span className="text-xs font-medium" style={{ color: '#14181F', fontFamily: row.mono ? '"Geist Mono", monospace' : 'Geist, sans-serif' }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {selectedUser.role !== 'ADMIN' && (
                  <button
                    className="w-full py-2.5 rounded-lg text-sm font-medium border"
                    style={{ borderColor: '#E5E2D9', color: '#0F2A47', fontFamily: 'Geist, sans-serif' }}
                  >
                    {selectedUser.role === 'STAFF' ? 'Demote to USER' : 'Promote to STAFF'}
                  </button>
                )}
                <button
                  className="w-full py-2.5 rounded-lg text-sm font-medium border"
                  style={{ borderColor: '#FBEDEB', color: '#A8362F', fontFamily: 'Geist, sans-serif' }}
                >
                  Suspend account
                </button>
              </div>
            </div>
          ) : (
            <div
              className="rounded-xl border p-6 text-center"
              style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}
            >
              <p className="text-sm" style={{ color: '#8A8F99', fontFamily: 'Geist, sans-serif' }}>
                Select a user to view their details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
