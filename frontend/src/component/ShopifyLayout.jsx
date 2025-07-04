import React from 'react';
import ShopifySidebar from './ShopifySidebar';
import { Outlet } from 'react-router-dom';

const ShopifyLayout = () => (
  <div style={{ display: 'flex' }}>
    <ShopifySidebar />
    <div style={{ flex: 1 }}>
      <Outlet />
    </div>
  </div>
);

export default ShopifyLayout; 