import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { BloodGroupBadge } from '../../components/BloodGroupBadge';
import { TrendChart } from '../../components/TrendChart';
import { Modal } from '../../components/Modal';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import {
  Droplet,
  AlertTriangle,
  Clock,
  Plus,
  Filter,
  RefreshCw,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';

interface InventoryPageProps {
  onCreateShortageForGroup?: (bloodGroup: string) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  onCreateShortageForGroup,
}) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [componentFilter, setComponentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Adjustment modal state
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustUnits, setAdjustUnits] = useState<number>(1);
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/inventory').then((r) => r.json());
      setItems(res.inventory || []);
      setSummary(res.summary || null);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      setAdjusting(true);
      await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blood_bank_id: selectedItem.blood_bank_id,
          blood_group: selectedItem.blood_group,
          component: selectedItem.component,
          units_delta: adjustUnits,
        }),
      });
      setAdjustModalOpen(false);
      fetchInventory();
    } catch (err) {
      console.error('Failed to adjust stock:', err);
    } finally {
      setAdjusting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (groupFilter !== 'ALL' && item.blood_group !== groupFilter) return false;
    if (componentFilter !== 'ALL' && item.component !== componentFilter) return false;
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    return true;
  });

  // Mock trend data for O+ Whole Blood showing recent sudden depletion
  const trendData = [
    { label: '5d ago', value: 16 },
    { label: '4d ago', value: 14 },
    { label: '3d ago', value: 15 },
    { label: '2d ago', value: 11 },
    { label: 'Yesterday', value: 9 },
    { label: 'Today (Critical)', value: 3 },
  ];

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Blood Inventory Management</h1>
          <p className="page-subtitle">
            Current stock reserves, minimum operating safety thresholds, and 48-hour expiration tracking.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchInventory} className="btn btn-outline btn-md" title="Refresh stock">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : (
        <>
          {/* Top Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div className="stat-card">
              <div className="stat-title">
                <Droplet size={16} color="var(--color-primary)" />
                Total Usable Stock
              </div>
              <div className="stat-value">{summary?.totalAvailableUnits || 0}</div>
              <div className="stat-desc">Units ready for cross-match & issue</div>
            </div>

            <div className="stat-card" style={{ borderColor: summary?.criticalShortageGroups > 0 ? 'var(--color-critical-border)' : 'var(--color-border)' }}>
              <div className="stat-title" style={{ color: 'var(--color-critical)' }}>
                <AlertTriangle size={16} />
                Critical Deficits
              </div>
              <div className="stat-value" style={{ color: 'var(--color-critical)' }}>
                {summary?.criticalShortageGroups || 0}
              </div>
              <div className="stat-desc">
                {summary?.criticalShortageGroups > 0 ? 'Immediate donor mobilization required' : 'No critical deficits'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-title" style={{ color: 'var(--color-warning)' }}>
                <TrendingDown size={16} />
                Low Stock Groups
              </div>
              <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
                {summary?.lowStockGroups || 0}
              </div>
              <div className="stat-desc">Below minimum baseline threshold</div>
            </div>

            <div className="stat-card">
              <div className="stat-title">
                <Clock size={16} color="var(--color-info)" />
                Expiring in 48 Hours
              </div>
              <div className="stat-value">{summary?.expiringUnits48h || 0}</div>
              <div className="stat-desc">Priority release for scheduled procedures</div>
            </div>
          </div>

          {/* Trend & Deficit Highlight Banner */}
          <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
                  Active Deficit Focus: O+ Whole Blood (3 units remaining)
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  Rapid consumption due to trauma center intake. Threshold is 15 units.
                </p>
              </div>
              {onCreateShortageForGroup && (
                <button
                  onClick={() => onCreateShortageForGroup('O+')}
                  className="btn btn-critical btn-sm"
                >
                  Create Emergency Shortage for O+ <ArrowUpRight size={14} />
                </button>
              )}
            </div>

            <TrendChart
              data={trendData}
              height={140}
              color="#B42318"
              title="O+ Whole Blood 5-Day Depletion Trend (Units Available)"
            />
          </div>

          {/* Inventory Data Table */}
          <div className="card">
            {/* Filter Bar */}
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--color-border-subtle)',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
                backgroundColor: 'var(--color-surface-hover)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                <Filter size={15} /> Filters:
              </div>

              {/* Blood Group Filter */}
              <select
                className="form-select"
                style={{ width: 'auto', padding: '5px 10px', fontSize: '13px' }}
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
              >
                <option value="ALL">All Blood Groups</option>
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>

              {/* Component Filter */}
              <select
                className="form-select"
                style={{ width: 'auto', padding: '5px 10px', fontSize: '13px' }}
                value={componentFilter}
                onChange={(e) => setComponentFilter(e.target.value)}
              >
                <option value="ALL">All Components</option>
                <option value="Whole Blood">Whole Blood</option>
                <option value="Packed RBC">Packed RBC</option>
                <option value="Platelets">Platelets</option>
                <option value="Fresh Frozen Plasma">Fresh Frozen Plasma</option>
              </select>

              {/* Status Filter */}
              <select
                className="form-select"
                style={{ width: 'auto', padding: '5px 10px', fontSize: '13px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Stock Statuses</option>
                <option value="critical">Critical Shortage Only</option>
                <option value="low">Low Reserve Only</option>
                <option value="normal">Normal Operating Levels</option>
              </select>

              <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Showing {filteredItems.length} of {items.length} records
              </span>
            </div>

            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Blood Group</th>
                    <th>Component</th>
                    <th>Available Stock</th>
                    <th>Reserved</th>
                    <th>Safety Threshold</th>
                    <th>Expiring (48h)</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      style={{
                        backgroundColor: item.status === 'critical' ? 'rgba(254, 228, 226, 0.25)' : 'transparent',
                      }}
                    >
                      <td>
                        <BloodGroupBadge
                          group={item.blood_group}
                          variant={item.status === 'critical' ? 'critical' : 'default'}
                        />
                      </td>
                      <td style={{ fontWeight: 500 }}>{item.component}</td>
                      <td>
                        <span style={{ fontSize: '15px', fontWeight: 700 }}>
                          {item.available_units}
                        </span>{' '}
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>units</span>
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{item.reserved_units} units</td>
                      <td>
                        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                          Min {item.min_threshold_units}
                        </span>
                      </td>
                      <td>
                        {item.expiring_units_48h > 0 ? (
                          <span className="badge badge-warning" style={{ fontSize: '11px' }}>
                            {item.expiring_units_48h} units
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>0</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setAdjustUnits(1);
                              setAdjustModalOpen(true);
                            }}
                            className="btn btn-outline btn-sm"
                            title="Record unit inflow or adjustment"
                          >
                            <Plus size={13} />
                            Adjust
                          </button>
                          {item.status === 'critical' && onCreateShortageForGroup && (
                            <button
                              onClick={() => onCreateShortageForGroup(item.blood_group)}
                              className="btn btn-critical btn-sm"
                              title="Create emergency shortage request"
                            >
                              Mobilize
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Stock Adjustment Modal */}
      {selectedItem && (
        <Modal
          isOpen={adjustModalOpen}
          onClose={() => setAdjustModalOpen(false)}
          title={`Adjust Inventory: ${selectedItem.blood_group} ${selectedItem.component}`}
          footer={
            <>
              <button onClick={() => setAdjustModalOpen(false)} className="btn btn-outline btn-sm">
                Cancel
              </button>
              <button
                onClick={handleAdjustSubmit}
                disabled={adjusting}
                className="btn btn-primary btn-sm"
              >
                {adjusting ? 'Updating...' : 'Confirm Adjustment'}
              </button>
            </>
          }
        >
          <form onSubmit={handleAdjustSubmit}>
            <div style={{ marginBottom: '14px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Current stock level: <strong>{selectedItem.available_units} units</strong> at {selectedItem.blood_bank_name || 'City Central Blood Bank'}.
            </div>

            <div className="form-group">
              <label className="form-label">Units to Add or Deduct</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setAdjustUnits((u) => Math.max(-selectedItem.available_units, u - 1))}
                  className="btn btn-outline btn-md"
                >
                  -1
                </button>
                <input
                  type="number"
                  className="form-input"
                  style={{ textAlign: 'center', fontWeight: 600, fontSize: '16px' }}
                  value={adjustUnits}
                  onChange={(e) => setAdjustUnits(parseInt(e.target.value) || 0)}
                />
                <button
                  type="button"
                  onClick={() => setAdjustUnits((u) => u + 1)}
                  className="btn btn-outline btn-md"
                >
                  +1
                </button>
              </div>
              <div className="form-help">
                Use positive values for incoming donor units / verified deliveries; negative for clinical release.
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
