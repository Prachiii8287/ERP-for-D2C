import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ShopifySidebar from './ShopifySidebar';

const ShopifyDashboard = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [companyName, setCompanyName] = useState('Bio Mac Lifesciences');

  // Sample data
  const stockData = [
    { name: 'Under Stock', value: 5.17, color: '#f59e0b', items: 15 },
    { name: 'Overstock', value: 27.59, color: '#ef4444', items: 32 },
    { name: 'Optimum Stock', value: 67.24, color: '#10b981', items: 89 }
  ];

  const dealsByStatus = [
    { name: 'Pending', value: 100, color: '#3b82f6' },
    { name: 'Converted', value: 0, color: '#10b981' },
    { name: 'Cancelled', value: 0, color: '#ef4444' }
  ];

  const saleOrders = [
    { orderName: 'ChocolateX Rigid King Box', customer: 'Likwid Techserve', quantity: 2000.00, amount: 200000.00, status: 'F' },
    { orderName: 'Gladiator Box', customer: 'Tensav Pvt Ltd', quantity: 1000.00, amount: 50000.00, status: 'F' },
    { orderName: 'Gladiator Box', customer: 'Tensav Pvt Ltd', quantity: 2000.00, amount: 100000.00, status: 'F' },
    { orderName: 'Gynofree', customer: 'Likwid Techserve', quantity: 5000.00, amount: 100000.00, status: 'F' },
    { orderName: 'Macashwajit 30 Caps', customer: 'Likwid Techserve', quantity: 30000.00, amount: 45000.00, status: 'A' },
    { orderName: 'NA', customer: 'Likwid Techserve', quantity: 1000.00, amount: 15000.00, status: 'F' }
  ];

  const purchaseOrders = [
    { poItem: 'Ashwagandha Raw Herb', vendor: 'Tirupati Herbs', quantity: 100.00, amount: 26250.00, status: 'N' },
    { poItem: 'Brute Bottles - 200ml', vendor: 'Pure Pet Industries', quantity: 10000.00, amount: 33630.00, status: 'N' },
    { poItem: 'Coughenza Cartons', vendor: 'Tirupati Herbs', quantity: 13000.00, amount: 76700.00, status: 'N' },
    { poItem: 'Coughenza Labels', vendor: 'Tirupati Herbs', quantity: 15000.00, amount: 17700.00, status: 'N' },
    { poItem: 'Gynofree Cartons', vendor: 'Pure Pet Industries', quantity: 3000.00, amount: 9558.00, status: 'N' },
    { poItem: 'Nuts & Bolts', vendor: 'Pure Pet Industries', quantity: 100000.00, amount: 118000.00, status: 'N' }
  ];

  const StatCard = ({ title, value, subtitle, bgColor }) => {
    const getBackgroundColor = (bgColor) => {
      switch(bgColor) {
        case 'bg-blue-500': return '#3b82f6';
        case 'bg-indigo-500': return '#6366f1';
        case 'bg-purple-500': return '#8b5cf6';
        case 'bg-purple-600': return '#7c3aed';
        default: return '#3b82f6';
      }
    };

    return (
      <div style={{
        backgroundColor: getBackgroundColor(bgColor),
        borderRadius: '8px',
        padding: '24px',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold'
            }}>{value}</div>
            <div style={{
              fontSize: '14px',
              opacity: '0.9'
            }}>{subtitle}</div>
          </div>
          <div style={{
            fontSize: '30px',
            opacity: '0.7'
          }}>
            {title.includes('Order') ? '📊' : title.includes('Customers') ? '👥' : title.includes('Goods') ? '📦' : '💰'}
          </div>
        </div>
      </div>
    );
  };

  const StockChart = ({ data, title }) => {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '24px', color: '#222' }}>{title}</h3>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
          {data.map((item, index) => (
            <div key={index} style={{
              flex: 1,
              backgroundColor: item.color + '15',
              borderRadius: '16px',
              padding: '24px',
              minWidth: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 600, color: item.color, marginBottom: 8 }}>{item.name}</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#222', marginBottom: 4 }}>{item.value}%</div>
              <div style={{ fontSize: '16px', color: '#444', marginBottom: 16 }}>{item.items} Items</div>
              <div style={{ width: '100%', backgroundColor: '#ececec', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                <div style={{
                  height: '10px',
                  borderRadius: '8px',
                  backgroundColor: item.color,
                  width: item.value + '%',
                  transition: 'width 0.5s'
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const PieChartComponent = ({ data, title }) => {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#1f2937'
        }}>{title}</h3>
        <div style={{ height: '256px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ marginTop: '16px' }}>
          {data.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '4px',
              paddingBottom: '4px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                <div 
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    marginRight: '8px',
                    backgroundColor: item.color
                  }}
                ></div>
                <span style={{ fontSize: '14px' }}>{item.name}</span>
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: '600'
              }}>{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const OrderTable = ({ orders, type }) => {
    const getStatusStyle = (status) => {
      if (status === 'F') {
        return {
          backgroundColor: '#dcfce7',
          color: '#166534'
        };
      } else if (status === 'A') {
        return {
          backgroundColor: '#fef3c7',
          color: '#92400e'
        };
      } else {
        return {
          backgroundColor: '#dbeafe',
          color: '#1e40af'
        };
      }
    };

    const getStatusText = (status) => {
      if (status === 'F') return 'Fulfilled';
      if (status === 'A') return 'Active';
      return 'New';
    };

    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            {type === 'sale' ? 'Sale Orders' : 'Purchase Orders'}
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                {type === 'sale' ? (
                  <>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Order Name</th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Customer</th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Quantity</th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Amount</th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Status</th>
                  </>
                ) : (
                  <>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>PO Item</th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Vendor</th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Quantity</th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Amount</th>
                    <th style={{
                      padding: '12px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody style={{
              backgroundColor: 'white'
            }}>
              {orders.map((order, index) => (
                <tr key={index} style={{
                  borderBottom: '1px solid #e5e7eb'
                }} onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = '#f9fafb'}
                   onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'white'}>
                  <td style={{
                    padding: '16px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#111827'
                  }}>
                    {type === 'sale' ? order.orderName : order.poItem}
                  </td>
                  <td style={{
                    padding: '16px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    {type === 'sale' ? order.customer : order.vendor}
                  </td>
                  <td style={{
                    padding: '16px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    {order.quantity.toLocaleString()}
                  </td>
                  <td style={{
                    padding: '16px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#059669'
                  }}>
                    ₹{order.amount.toLocaleString()}
                  </td>
                  <td style={{
                    padding: '16px 24px',
                    whiteSpace: 'nowrap'
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      padding: '2px 8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      borderRadius: '9999px',
                      ...getStatusStyle(order.status)
                    }}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <h1 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1f2937'
      }}>Welcome, Bing</h1>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateRows: 'repeat(2, 1fr)',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px'
      }}>
        <StatCard
          title="Average Order Value"
          value="3525250.00"
          subtitle="Average Order Value: 117508.33 from 30 pending orders"
          bgColor="bg-blue-500"
        />
        <StatCard
          title="Customers"
          value="5"
          subtitle="Customers from 4 categories"
          bgColor="bg-indigo-500"
        />
        <StatCard
          title="Add Finished Goods"
          value="3515615.73"
          subtitle="from 3 finished goods"
          bgColor="bg-purple-500"
        />
        <StatCard
          title="Total Items"
          value="3515615.73"
          subtitle="from 55 items"
          bgColor="bg-purple-600"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <StockChart data={stockData} title="Stock Analysis" />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '24px'
        }}>
          <PieChartComponent data={dealsByStatus} title="Deals by Status" />
          <PieChartComponent data={dealsByStatus} title="Deals by Amount" />
        </div>
      </div>

      {/* Orders Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <OrderTable orders={saleOrders} type="sale" />
        <OrderTable orders={purchaseOrders} type="purchase" />
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa' }}>
      <div style={{ width: '250px', flexShrink: 0 }}>
        <ShopifySidebar />
      </div>
      <main style={{ flex: 1, padding: '32px', background: '#f5f6fa', minHeight: '100vh' }}>
        <div style={{
          padding: '16px 0'
        }}>
          {renderDashboard()}
        </div>
      </main>
    </div>
  );
};

export default ShopifyDashboard;