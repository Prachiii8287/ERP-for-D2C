import React from 'react';
import ShopifySidebar from './ShopifySidebar';
import { Outlet } from 'react-router-dom';

const ShopifyLayout = () => (
  <div style={{ display: 'flex' }}>
    <ShopifySidebar />
    <div style={{ flex: 1, marginLeft: '250px' }}>
      <Outlet />
    </div>
  </div>
);

export default ShopifyLayout; 