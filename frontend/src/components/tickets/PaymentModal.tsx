/**
 * PaymentModal Component
 * Complete payment flow for pending tickets
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/ticketUtils';

interface PaymentModalProps {
    visible: boolean;
    onClose: () => void;
    amount: number;
    walletBalance?: number;
    onPaymentSuccess: (method: string) => void;
}

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

const PaymentModal: React.FC<PaymentModalProps> = ({
    visible,
    onClose,
    amount,
    walletBalance = 0,
    onPaymentSuccess,
}) => {
    const { colors } = useTheme();
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [step, setStep] = useState<'select' | 'confirm' | 'processing'>('select');

    const paymentMethods = [
        {
            id: 'upi' as PaymentMethod,
            name: 'UPI',
            icon: 'phone-portrait',
            description: 'GPay, PhonePe, Paytm',
            color: '#5F6368',
        },
        {
            id: 'card' as PaymentMethod,
            name: 'Card',
            icon: 'card',
            description: 'Credit / Debit Card',
            color: '#1A73E8',
        },
        {
            id: 'netbanking' as PaymentMethod,
            name: 'Net Banking',
            icon: 'business',
            description: 'All major banks',
            color: '#34A853',
        },
        {
            id: 'wallet' as PaymentMethod,
            name: 'Wallet',
            icon: 'wallet',
            description: `Balance: ${formatCurrency(walletBalance)}`,
            color: '#EA4335',
            disabled: walletBalance < amount,
        },
    ];

    const handleMethodSelect = (method: PaymentMethod) => {
        setSelectedMethod(method);
        setStep('confirm');
    };

    const handlePayment = () => {
        setStep('processing');

        // Simulate payment processing
        setTimeout(() => {
            Alert.alert(
                'Payment Successful!',
                `Your payment of ${formatCurrency(amount)} has been processed successfully.`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            onPaymentSuccess(selectedMethod || 'upi');
                            handleClose();
                        },
                    },
                ]
            );
        }, 2000);
    };

    const handleClose = () => {
        setStep('select');
        setSelectedMethod(null);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            {step === 'select' && 'Select Payment Method'}
                            {step === 'confirm' && 'Confirm Payment'}
                            {step === 'processing' && 'Processing...'}
                        </Text>
                        <TouchableOpacity onPress={handleClose} disabled={step === 'processing'}>
                            <Ionicons name="close" size={28} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Amount Display */}
                        <View style={[styles.amountCard, { backgroundColor: colors.primary + '10' }]}>
                            <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
                                Amount to Pay
                            </Text>
                            <Text style={[styles.amountValue, { color: colors.primary }]}>
                                {formatCurrency(amount)}
                            </Text>
                        </View>

                        {/* Select Payment Method */}
                        {step === 'select' && (
                            <View style={styles.methodsContainer}>
                                {paymentMethods.map((method) => (
                                    <TouchableOpacity
                                        key={method.id}
                                        style={[
                                            styles.methodCard,
                                            { backgroundColor: colors.background, borderColor: colors.border },
                                            method.disabled && styles.methodCardDisabled,
                                        ]}
                                        onPress={() => !method.disabled && handleMethodSelect(method.id)}
                                        disabled={method.disabled}
                                        activeOpacity={0.7}
                                    >
                                        <View
                                            style={[
                                                styles.methodIcon,
                                                { backgroundColor: method.color + '20' },
                                            ]}
                                        >
                                            <Ionicons
                                                name={method.icon as any}
                                                size={28}
                                                color={method.disabled ? colors.textTertiary : method.color}
                                            />
                                        </View>
                                        <View style={styles.methodInfo}>
                                            <Text
                                                style={[
                                                    styles.methodName,
                                                    { color: method.disabled ? colors.textTertiary : colors.text },
                                                ]}
                                            >
                                                {method.name}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.methodDesc,
                                                    { color: colors.textSecondary },
                                                ]}
                                            >
                                                {method.description}
                                            </Text>
                                        </View>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={20}
                                            color={method.disabled ? colors.textTertiary : colors.textSecondary}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Confirm Payment */}
                        {step === 'confirm' && selectedMethod && (
                            <View style={styles.confirmContainer}>
                                <View
                                    style={[
                                        styles.selectedMethodCard,
                                        { backgroundColor: colors.background, borderColor: colors.primary },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.selectedMethodIcon,
                                            {
                                                backgroundColor:
                                                    paymentMethods.find((m) => m.id === selectedMethod)?.color +
                                                    '20',
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name={
                                                paymentMethods.find((m) => m.id === selectedMethod)?.icon as any
                                            }
                                            size={32}
                                            color={
                                                paymentMethods.find((m) => m.id === selectedMethod)?.color
                                            }
                                        />
                                    </View>
                                    <Text style={[styles.selectedMethodName, { color: colors.text }]}>
                                        {paymentMethods.find((m) => m.id === selectedMethod)?.name}
                                    </Text>
                                </View>

                                <View style={styles.confirmDetails}>
                                    <View style={styles.confirmRow}>
                                        <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>
                                            Payment Method
                                        </Text>
                                        <Text style={[styles.confirmValue, { color: colors.text }]}>
                                            {paymentMethods.find((m) => m.id === selectedMethod)?.name}
                                        </Text>
                                    </View>
                                    <View style={styles.confirmRow}>
                                        <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>
                                            Amount
                                        </Text>
                                        <Text style={[styles.confirmValue, { color: colors.primary }]}>
                                            {formatCurrency(amount)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.confirmActions}>
                                    <TouchableOpacity
                                        style={[
                                            styles.confirmButton,
                                            styles.confirmButtonSecondary,
                                            { backgroundColor: colors.background, borderColor: colors.border },
                                        ]}
                                        onPress={() => setStep('select')}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.confirmButtonText, { color: colors.text }]}>
                                            Change Method
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.confirmButton,
                                            { backgroundColor: colors.primary },
                                        ]}
                                        onPress={handlePayment}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.confirmButtonTextPrimary}>Pay Now</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Processing */}
                        {step === 'processing' && (
                            <View style={styles.processingContainer}>
                                <View style={styles.processingIcon}>
                                    <Ionicons name="hourglass" size={48} color={colors.primary} />
                                </View>
                                <Text style={[styles.processingText, { color: colors.text }]}>
                                    Processing your payment...
                                </Text>
                                <Text style={[styles.processingSubtext, { color: colors.textSecondary }]}>
                                    Please wait, do not close this window
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    amountCard: {
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    amountLabel: {
        fontSize: 14,
        marginBottom: 8,
    },
    amountValue: {
        fontSize: 32,
        fontWeight: '700',
    },
    methodsContainer: {
        gap: 12,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 16,
    },
    methodCardDisabled: {
        opacity: 0.5,
    },
    methodIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    methodInfo: {
        flex: 1,
    },
    methodName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    methodDesc: {
        fontSize: 13,
    },
    confirmContainer: {
        gap: 24,
    },
    selectedMethodCard: {
        alignItems: 'center',
        padding: 24,
        borderRadius: 16,
        borderWidth: 2,
    },
    selectedMethodIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    selectedMethodName: {
        fontSize: 20,
        fontWeight: '700',
    },
    confirmDetails: {
        gap: 16,
    },
    confirmRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    confirmLabel: {
        fontSize: 15,
    },
    confirmValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    confirmActions: {
        flexDirection: 'row',
        gap: 12,
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmButtonSecondary: {
        borderWidth: 1,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButtonTextPrimary: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    processingContainer: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    processingIcon: {
        marginBottom: 24,
    },
    processingText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    processingSubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
});

export default PaymentModal;
