/**
 * CompensationStep Component
 * Step 4: Collect compensation and benefits information
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { JobFormData, SalaryType } from '../../types/job.types';
import { CURRENCIES } from '../../data/jobCategories';
import { BENEFITS_TEMPLATES, POPULAR_BENEFITS } from '../../data/benefitsTemplates';

interface Props {
    formData: Partial<JobFormData>;
    onUpdate: (data: Partial<JobFormData>) => void;
    errors?: any;
}

const CompensationStep: React.FC<Props> = ({ formData, onUpdate, errors }) => {
    const { colors } = useTheme();
    const [newBenefit, setNewBenefit] = useState('');
    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

    const salaryTypes: { value: SalaryType; label: string }[] = [
        { value: 'yearly', label: 'Per Year' },
        { value: 'monthly', label: 'Per Month' },
        { value: 'hourly', label: 'Per Hour' },
    ];

    const toggleBenefit = (benefit: string) => {
        const current = formData.benefits || [];
        if (current.includes(benefit)) {
            onUpdate({ benefits: current.filter(b => b !== benefit) });
        } else {
            onUpdate({ benefits: [...current, benefit] });
        }
    };

    const addCustomBenefit = () => {
        if (newBenefit.trim()) {
            onUpdate({
                customBenefits: [
                    ...(formData.customBenefits || []),
                    newBenefit.trim(),
                ],
                benefits: [
                    ...(formData.benefits || []),
                    newBenefit.trim(),
                ],
            });
            setNewBenefit('');
        }
    };

    const selectedCurrency = CURRENCIES.find(c => c.code === formData.salary?.currency) || CURRENCIES[0];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Salary Range */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Salary Range <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.salaryRow}>
                    <View style={styles.salaryInput}>
                        <Text style={[styles.salaryLabel, { color: colors.textSecondary }]}>
                            Minimum
                        </Text>
                        <View style={styles.currencyInput}>
                            <Text style={[styles.currencySymbol, { color: colors.text }]}>
                                {selectedCurrency.symbol}
                            </Text>
                            <TextInput
                                style={[
                                    styles.numberInputFlex,
                                    { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                                ]}
                                placeholder="0"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                                value={formData.salary?.min?.toString() || ''}
                                onChangeText={(text) =>
                                    onUpdate({
                                        salary: {
                                            ...formData.salary,
                                            min: parseInt(text) || 0,
                                        } as any,
                                    })
                                }
                            />
                        </View>
                    </View>
                    <Text style={[styles.separator, { color: colors.textSecondary }]}>-</Text>
                    <View style={styles.salaryInput}>
                        <Text style={[styles.salaryLabel, { color: colors.textSecondary }]}>
                            Maximum
                        </Text>
                        <View style={styles.currencyInput}>
                            <Text style={[styles.currencySymbol, { color: colors.text }]}>
                                {selectedCurrency.symbol}
                            </Text>
                            <TextInput
                                style={[
                                    styles.numberInputFlex,
                                    { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                                ]}
                                placeholder="0"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                                value={formData.salary?.max?.toString() || ''}
                                onChangeText={(text) =>
                                    onUpdate({
                                        salary: {
                                            ...formData.salary,
                                            max: parseInt(text) || 0,
                                        } as any,
                                    })
                                }
                            />
                        </View>
                    </View>
                </View>
                {errors?.salary && (
                    <Text style={styles.errorText}>{errors.salary}</Text>
                )}
            </View>

            {/* Currency & Salary Type */}
            <View style={styles.row}>
                <View style={[styles.field, { flex: 1 }]}>
                    <Text style={[styles.label, { color: colors.text }]}>Currency</Text>
                    <TouchableOpacity
                        style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                    >
                        <Text style={[styles.dropdownText, { color: colors.text }]}>
                            {selectedCurrency.code}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {showCurrencyDropdown && (
                        <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            {CURRENCIES.map((currency) => (
                                <TouchableOpacity
                                    key={currency.code}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        onUpdate({
                                            salary: {
                                                ...formData.salary,
                                                currency: currency.code,
                                            } as any,
                                        });
                                        setShowCurrencyDropdown(false);
                                    }}
                                >
                                    <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                                        {currency.symbol} {currency.code}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <View style={[styles.field, { flex: 1 }]}>
                    <Text style={[styles.label, { color: colors.text }]}>Period</Text>
                    <View style={styles.typeRow}>
                        {salaryTypes.map((type) => (
                            <TouchableOpacity
                                key={type.value}
                                style={[
                                    styles.typeChip,
                                    {
                                        backgroundColor:
                                            formData.salary?.type === type.value
                                                ? colors.primary
                                                : colors.surface,
                                        borderColor:
                                            formData.salary?.type === type.value
                                                ? colors.primary
                                                : colors.border,
                                    },
                                ]}
                                onPress={() =>
                                    onUpdate({
                                        salary: {
                                            ...formData.salary,
                                            type: type.value,
                                        } as any,
                                    })
                                }
                            >
                                <Text
                                    style={[
                                        styles.typeText,
                                        {
                                            color:
                                                formData.salary?.type === type.value
                                                    ? '#FFFFFF'
                                                    : colors.text,
                                        },
                                    ]}
                                >
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Show Salary Toggle */}
            <TouchableOpacity
                style={styles.toggleRow}
                onPress={() =>
                    onUpdate({
                        salary: {
                            ...formData.salary,
                            showSalary: !formData.salary?.showSalary,
                        } as any,
                    })
                }
            >
                <View style={styles.toggleLeft}>
                    <Ionicons name="eye-outline" size={20} color={colors.text} />
                    <Text style={[styles.toggleText, { color: colors.text }]}>
                        Show salary in job posting
                    </Text>
                </View>
                <View
                    style={[
                        styles.toggle,
                        {
                            backgroundColor: formData.salary?.showSalary
                                ? colors.primary
                                : colors.border,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.toggleThumb,
                            formData.salary?.showSalary && styles.toggleThumbActive,
                        ]}
                    />
                </View>
            </TouchableOpacity>

            {/* Benefits */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Benefits & Perks <Text style={styles.required}>*</Text>
                </Text>
                <Text style={[styles.hint, { color: colors.textSecondary }]}>
                    Select popular benefits or add custom ones
                </Text>
                <View style={styles.benefitsGrid}>
                    {POPULAR_BENEFITS.map((benefit) => (
                        <TouchableOpacity
                            key={benefit}
                            style={[
                                styles.benefitChip,
                                {
                                    backgroundColor: formData.benefits?.includes(benefit)
                                        ? colors.primary + '20'
                                        : colors.surface,
                                    borderColor: formData.benefits?.includes(benefit)
                                        ? colors.primary
                                        : colors.border,
                                },
                            ]}
                            onPress={() => toggleBenefit(benefit)}
                        >
                            {formData.benefits?.includes(benefit) && (
                                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                            )}
                            <Text
                                style={[
                                    styles.benefitText,
                                    {
                                        color: formData.benefits?.includes(benefit)
                                            ? colors.primary
                                            : colors.text,
                                    },
                                ]}
                            >
                                {benefit}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                {errors?.benefits && (
                    <Text style={styles.errorText}>{errors.benefits}</Text>
                )}
            </View>

            {/* Custom Benefits */}
            <View style={styles.field}>
                <Text style={[styles.label, { color: colors.text }]}>
                    Add Custom Benefit
                </Text>
                <View style={styles.inputWithButton}>
                    <TextInput
                        style={[
                            styles.inputFlex,
                            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                        ]}
                        placeholder="e.g. Pet-friendly office"
                        placeholderTextColor={colors.textSecondary}
                        value={newBenefit}
                        onChangeText={setNewBenefit}
                        onSubmitEditing={addCustomBenefit}
                    />
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={addCustomBenefit}
                    >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    field: {
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 8,
    },
    required: {
        color: '#EF4444',
    },
    hint: {
        fontSize: 13,
        marginBottom: 12,
    },
    salaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    salaryInput: {
        flex: 1,
    },
    salaryLabel: {
        fontSize: 13,
        marginBottom: 6,
    },
    currencyInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    currencySymbol: {
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    numberInputFlex: {
        flex: 1,
        fontSize: 15,
        padding: 0,
    },
    separator: {
        fontSize: 18,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    dropdownText: {
        fontSize: 15,
    },
    dropdownList: {
        marginTop: 8,
        borderWidth: 1,
        borderRadius: 12,
        maxHeight: 150,
    },
    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    dropdownItemText: {
        fontSize: 15,
    },
    typeRow: {
        gap: 8,
    },
    typeChip: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 8,
    },
    typeText: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        marginBottom: 24,
    },
    toggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    toggleText: {
        fontSize: 15,
        fontWeight: '500',
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        padding: 2,
        justifyContent: 'center',
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
    },
    toggleThumbActive: {
        alignSelf: 'flex-end',
    },
    benefitsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    benefitChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        gap: 6,
    },
    benefitText: {
        fontSize: 13,
        fontWeight: '500',
    },
    inputWithButton: {
        flexDirection: 'row',
        gap: 10,
    },
    inputFlex: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        marginTop: 4,
    },
    bottomSpacing: {
        height: 40,
    },
});

export default CompensationStep;
