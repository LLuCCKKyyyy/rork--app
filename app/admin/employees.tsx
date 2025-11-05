import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import colors from '@/constants/colors';
import { Search, UserPlus, Mail, Phone, Briefcase } from 'lucide-react-native';
import { useState } from 'react';

const mockEmployees = [
  {
    id: 'emp-001',
    name: '张伟',
    email: 'zhangwei@example.com',
    phone: '+86 138 0000 0000',
    role: '现场技术员',
    isAdmin: false,
    status: 'active',
  },
  {
    id: 'admin-001',
    name: '管理员',
    email: 'admin@example.com',
    phone: '+86 138 0000 0001',
    role: '系统管理员',
    isAdmin: true,
    status: 'active',
  },
];

export default function EmployeesManagement() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = mockEmployees.filter((emp) =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索员工姓名或邮箱"
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addButton}>
          <UserPlus size={20} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.listTitle}>全部员工 ({filteredEmployees.length})</Text>
        {filteredEmployees.map((employee) => (
          <TouchableOpacity key={employee.id} style={styles.employeeCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{employee.name.charAt(0)}</Text>
            </View>
            <View style={styles.employeeInfo}>
              <View style={styles.employeeHeader}>
                <Text style={styles.employeeName}>{employee.name}</Text>
                {employee.isAdmin && (
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>管理员</Text>
                  </View>
                )}
              </View>
              <View style={styles.infoRow}>
                <Mail size={14} color={colors.textLight} />
                <Text style={styles.infoText}>{employee.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Phone size={14} color={colors.textLight} />
                <Text style={styles.infoText}>{employee.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Briefcase size={14} color={colors.textLight} />
                <Text style={styles.infoText}>{employee.role}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  employeeCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  employeeInfo: {
    flex: 1,
    gap: 6,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  employeeName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.text,
  },
  adminBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: colors.textLight,
  },
});
