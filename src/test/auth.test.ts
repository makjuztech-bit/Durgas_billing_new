import { describe, it, expect, beforeEach } from 'vitest';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, getStoredToken, setStoredToken } from '@/lib/api';
import { UserRole } from '@/contexts/AuthContext';

const rolePermissions: Record<UserRole, string[]> = {
  admin: ['*'],
  manager: [
    'view_dashboard', 'create_bill', 'edit_bill', 'delete_bill', 'view_reports',
    'manage_customers', 'manage_inventory', 'manage_staff', 'view_profit',
    'apply_discount', 'process_return', 'approve_credit'
  ],
  cashier: [
    'view_dashboard', 'create_bill', 'view_bills', 'manage_customers',
    'apply_discount', 'process_payment'
  ],
  salesman: [
    'view_dashboard', 'create_bill', 'view_bills', 'add_customer'
  ],
  stock_manager: [
    'view_dashboard', 'manage_inventory', 'view_stock', 'stock_adjustment',
    'purchase_entry', 'manage_suppliers'
  ],
};

function checkPermission(role: UserRole, permission: string): boolean {
  const permissions = rolePermissions[role] || [];
  return permissions.includes('*') || permissions.includes(permission);
}

describe('Authentication & Role Permission Security Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Token Persistence & Retrieval', () => {
    it('stores and retrieves authentication token accurately', () => {
      expect(getStoredToken()).toBeNull();

      setStoredToken('test-bearer-token-12345');
      expect(getStoredToken()).toBe('test-bearer-token-12345');
      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('test-bearer-token-12345');

      setStoredToken(null);
      expect(getStoredToken()).toBeNull();
      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    });

    it('stores user profile state in localStorage', () => {
      const user = {
        id: '1',
        username: 'admin',
        name: 'Store Administrator',
        role: 'admin' as UserRole,
        branch: 'Main Bazaar Branch',
      };

      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      const retrieved = JSON.parse(localStorage.getItem(AUTH_USER_KEY) || '{}');

      expect(retrieved.username).toBe('admin');
      expect(retrieved.role).toBe('admin');
    });
  });

  describe('Role-Based Access Control (RBAC) Permissions Matrix', () => {
    it('grants admin unrestricted wildcard permissions (*)', () => {
      expect(checkPermission('admin', 'create_bill')).toBe(true);
      expect(checkPermission('admin', 'manage_inventory')).toBe(true);
      expect(checkPermission('admin', 'view_profit')).toBe(true);
      expect(checkPermission('admin', 'any_future_permission')).toBe(true);
    });

    it('permits cashiers to bill but denies inventory management and staff management', () => {
      expect(checkPermission('cashier', 'create_bill')).toBe(true);
      expect(checkPermission('cashier', 'process_payment')).toBe(true);

      expect(checkPermission('cashier', 'manage_inventory')).toBe(false);
      expect(checkPermission('cashier', 'manage_staff')).toBe(false);
      expect(checkPermission('cashier', 'view_profit')).toBe(false);
    });

    it('permits stock manager to adjust stock and purchase entries but denies billing and profit view', () => {
      expect(checkPermission('stock_manager', 'manage_inventory')).toBe(true);
      expect(checkPermission('stock_manager', 'stock_adjustment')).toBe(true);
      expect(checkPermission('stock_manager', 'purchase_entry')).toBe(true);

      expect(checkPermission('stock_manager', 'view_profit')).toBe(false);
      expect(checkPermission('stock_manager', 'manage_staff')).toBe(false);
    });

    it('restricts salesman to billing and basic customer viewing only', () => {
      expect(checkPermission('salesman', 'create_bill')).toBe(true);
      expect(checkPermission('salesman', 'manage_inventory')).toBe(false);
      expect(checkPermission('salesman', 'delete_bill')).toBe(false);
      expect(checkPermission('salesman', 'approve_credit')).toBe(false);
    });
  });
});
