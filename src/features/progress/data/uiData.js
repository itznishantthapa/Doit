import {
  CheckmarkCircle02Icon,
  CloudUploadIcon,
  Loading03Icon,
  MoneyReceiveSquareIcon,
} from '@hugeicons/core-free-icons';
import { GHOSTWHITE, LAVENDER, MINT, PEACH, TEXT_DARK } from '../../../constants/colors';
import { ASSIGNMENT_TYPES } from '../../pending/data/uiData';

export const PROGRESS_STEP_IDS = {
  PROVIDED: 'provided',
  PAYMENT: 'payment',
  DOING: 'doing',
  COMPLETED: 'completed',
};

export const PROGRESS_STEPS = [
  {
    id: PROGRESS_STEP_IDS.PROVIDED,
    title: 'Assignment Received',
    description: 'A helper is reviewing your assignment and will send the price shortly.',
    activeBackground: LAVENDER,
    inactiveBackground: '#F5F6F8',
    accentColor: '#8B7CB8',
    icon: CloudUploadIcon,
  },
  {
    id: PROGRESS_STEP_IDS.PAYMENT,
    title: 'Payment',
    activeBackground: MINT,
    inactiveBackground: '#F5F6F8',
    accentColor: '#2F6B52',
    icon: MoneyReceiveSquareIcon,
  },
  {
    id: PROGRESS_STEP_IDS.DOING,
    title: 'Doing',
    description: 'Your helper has started working on your assignment.',
    activeBackground: PEACH,
    inactiveBackground: '#F5F6F8',
    accentColor: '#B54708',
    icon: Loading03Icon,
  },
  {
    id: PROGRESS_STEP_IDS.COMPLETED,
    title: 'Completed',
    description: 'Your assignment has been completed and is ready to download.',
    activeBackground: GHOSTWHITE,
    inactiveBackground: '#F5F6F8',
    accentColor: TEXT_DARK,
    icon: CheckmarkCircle02Icon,
  },
];

export const PAYMENT_COPY = {
  active: 'Please complete your payment within 24 hours so we can begin your assignment and deliver it on time.\n(Click to proceed.)',
  inactive: 'Helper is reviewing and evaluating the price. Tap the info button to learn about assignment price ranges.',
  paid: 'You have successfully paid for this assignment.',
  rejected: 'We could not validate your payment. Please contact the helper.',
};

export const getAssignmentTypeLabel = (type) => ASSIGNMENT_TYPES[type] ?? type;

export const formatDeliveryDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const normalizeStepDetail = (stepId, detail) => {
  if (stepId !== PROGRESS_STEP_IDS.PAYMENT) return detail;

  return {
    ...detail,
    date: detail.payment_done_date ?? detail.payment_receipt_date ?? null,
  };
};

export const getPaymentDescription = (step, detail) => {
  if (step.id !== PROGRESS_STEP_IDS.PAYMENT) return step.description;
  if (!detail.is_active) return PAYMENT_COPY.inactive;
  if (detail.status === 'rejected') return PAYMENT_COPY.rejected;
  if (detail.status === 'completed') return PAYMENT_COPY.paid;
  return PAYMENT_COPY.active;
};

export const buildProgressSteps = (assignment) =>
  PROGRESS_STEPS.map((step) => {
    const detail = normalizeStepDetail(step.id, assignment.steps[step.id]);
    return {
      ...step,
      ...detail,
      description: getPaymentDescription(step, detail),
    };
  });
