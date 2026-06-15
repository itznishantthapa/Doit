import {
  CancelCircleIcon,
  Clock01Icon,
  Loading03Icon,
  MoneyReceiveSquareIcon,
  MoneyRemove01Icon,
  TaskDone01Icon,
} from '@hugeicons/core-free-icons';

export const ASSIGNMENT_STATUSES = {
  IN_REVIEW: 'in_review',
  UNSUBMITTED: 'unsubmitted',
  REJECTED: 'rejected',
  PAYMENT_PENDING: 'payment_pending',
  PAYMENT_REJECTED: 'payment_rejected',
  DOING: 'doing',
  COMPLETED: 'completed',
};

export const ASSIGNMENT_TYPES = {
  assessment: 'Assessment / Coursework',
  tutorial: 'Tutorial / Workshop',
  others: 'Others',
};

export const ASSIGNMENT_STATUS_CONFIG = {
  [ASSIGNMENT_STATUSES.IN_REVIEW]: {
    label: 'In Review',
    color: '#6B7280',
    icon: Clock01Icon,
  },
  [ASSIGNMENT_STATUSES.REJECTED]: {
    label: 'Rejected',
    color: '#DC2626',
    icon: CancelCircleIcon,
  },
  [ASSIGNMENT_STATUSES.PAYMENT_PENDING]: {
    label: 'Payment Pending',
    color: '#fb8500',
    icon: MoneyReceiveSquareIcon,
  },
  [ASSIGNMENT_STATUSES.PAYMENT_REJECTED]: {
    label: 'Payment Rejected',
    color: '#DC2626',
    icon: MoneyRemove01Icon,
  },
  [ASSIGNMENT_STATUSES.DOING]: {
    label: 'Doing',
    color: '#2F6B52',
    icon: Loading03Icon,
  },
  [ASSIGNMENT_STATUSES.COMPLETED]: {
    label: 'Completed',
    color: '#2F6B52',
    icon: TaskDone01Icon,
  },
};

