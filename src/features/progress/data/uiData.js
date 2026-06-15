import {
  CheckmarkCircle02Icon,
  CloudUploadIcon,
  Loading03Icon,
  MoneyReceiveSquareIcon,
} from '@hugeicons/core-free-icons';
import { GHOSTWHITE, LAVENDER, PEACH, TEXT_DARK } from '../../../constants/colors';
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
    activeBackground: LAVENDER,
    inactiveBackground: '#F5F6F8',
    accentColor: '#8B7CB8',
    icon: CloudUploadIcon,
  },
  {
    id: PROGRESS_STEP_IDS.PAYMENT,
    title: 'Payment',
    activeBackground: '#EAF8EB',
    inactiveBackground: '#F5F6F8',
    accentColor: '#27d935',
    icon: MoneyReceiveSquareIcon,
  },
  {
    id: PROGRESS_STEP_IDS.DOING,
    title: 'Doing',
    activeBackground: PEACH,
    inactiveBackground: '#F5F6F8',
    accentColor: '#B54708',
    icon: Loading03Icon,
  },
  {
    id: PROGRESS_STEP_IDS.COMPLETED,
    title: 'Completed',
    activeBackground: GHOSTWHITE,
    inactiveBackground: '#F5F6F8',
    accentColor: TEXT_DARK,
    icon: CheckmarkCircle02Icon,
  },
];

export const STEP_STATUS_COPY = {
  [PROGRESS_STEP_IDS.PROVIDED]: {
    pending: 'A helper is reviewing your assignment and will share the payment details for this assignment. \n(Usually takes 10-30 minutes)',
    completed: 'A helper has successfully reviewed you assignment.',
    rejected: "We're unable to assit you with this assignment.",
  },
  [PROGRESS_STEP_IDS.PAYMENT]: {
    pending: 'Helper will send you payment details shortly. Tap the info button to learn about assignment price ranges.',
    doing: 'You have submitted payment for this assignment, please wait sometime helper will verify your payment.',
    rejected: 'Helper could not validate your payment. Please contact the helper.',
    completed: 'You have successfully paid for this assignment.',
  },
  [PROGRESS_STEP_IDS.DOING]: {
    pending: 'Your helper has started working on your assignment.',
    completed: 'Your helper has completed your assignment.',
    rejected: 'Somehow helper is unable to do your assignment.',
  },
  [PROGRESS_STEP_IDS.COMPLETED]: {
    pending: 'Please click download button after helper finished your assignment',
    completed: 'Please contact with helper if any changes is required.',
    rejected: 'Somehow unable to deliver the assignment.',
  },
};

export const getAssignmentTypeLabel = (type) => ASSIGNMENT_TYPES[type] ?? type;

const WORK_TYPE_LABELS = {
  individual: 'Individual',
  group: 'Group',
};

export const getWorkTypeLabel = (workType) => {
  if (!workType) return null;
  const normalized = String(workType).toLowerCase();
  return WORK_TYPE_LABELS[normalized] ?? workType;
};

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

export const getStepDescription = (step, detail) => {
  const copy = STEP_STATUS_COPY[step.id];
  if (!copy) return '';

  if (!detail.is_active) return copy.pending;

  return copy[detail.status] ?? copy.pending;
};

export const buildProgressSteps = (assignment) =>
  PROGRESS_STEPS.map((step) => {
    const detail = normalizeStepDetail(step.id, assignment.steps[step.id]);
    return {
      ...step,
      ...detail,
      description: getStepDescription(step, detail),
    };
  });
