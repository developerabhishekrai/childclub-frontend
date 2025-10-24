import Swal from 'sweetalert2';

// SweetAlert2 Configuration for the project
const defaultConfig = {
  confirmButtonText: 'OK',
  cancelButtonText: 'Cancel',
  showCloseButton: true,
  showCancelButton: false,
  focusConfirm: true,
  allowOutsideClick: true,
  allowEscapeKey: true,
  buttonsStyling: false,
  customClass: {
    popup: 'sweet-alert-popup',
    confirmButton: 'btn btn-primary sweet-alert-confirm-btn',
    cancelButton: 'btn btn-secondary sweet-alert-cancel-btn',
    closeButton: 'sweet-alert-close-btn',
  }
};

// Success Alert
export const showSuccess = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#28a745',
    showCloseButton: true,
    allowOutsideClick: true,
    allowEscapeKey: true,
    buttonsStyling: true, // ✅ Use default SweetAlert2 button styling
    timer: 3000,
    timerProgressBar: true,
  });
};

// Error Alert
export const showError = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#dc3545',
    showCloseButton: true,
    allowOutsideClick: true,
    allowEscapeKey: true,
    buttonsStyling: true, // ✅ Use default SweetAlert2 button styling
  });
};

// Warning Alert
export const showWarning = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#ffc107',
    showCloseButton: true,
    allowOutsideClick: true,
    allowEscapeKey: true,
    buttonsStyling: true, // ✅ Use default SweetAlert2 button styling
  });
};

// Info Alert
export const showInfo = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'info',
    title,
    text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#17a2b8',
    showCloseButton: true,
    allowOutsideClick: true,
    allowEscapeKey: true,
    buttonsStyling: true, // ✅ Use default SweetAlert2 button styling
  });
};

// Confirmation Dialog
export const showConfirm = (
  title: string,
  text?: string,
  confirmText?: string,
  cancelText?: string
) => {
  return Swal.fire({
    icon: 'question',
    title,
    text,
    confirmButtonText: confirmText || 'Yes',
    cancelButtonText: cancelText || 'No',
    showCancelButton: true,
    showCloseButton: true,
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#dc3545',
    allowOutsideClick: true,
    allowEscapeKey: true,
    buttonsStyling: true, // ✅ Use default SweetAlert2 button styling
  });
};

// Loading Alert
export const showLoading = (title: string = 'Loading...', text?: string) => {
  return Swal.fire({
    ...defaultConfig,
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// Close Loading
export const closeLoading = () => {
  Swal.close();
};

// Custom Toast Notification
export const showToast = (
  icon: 'success' | 'error' | 'warning' | 'info',
  title: string,
  position: 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end' = 'top-end'
) => {
  const Toast = Swal.mixin({
    toast: true,
    position,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  return Toast.fire({
    icon,
    title,
  });
};

// Form Validation Error
export const showValidationError = (errors: string[]) => {
  const errorList = errors.map(error => `<li>${error}</li>`).join('');
  
  return Swal.fire({
    icon: 'error',
    title: 'Validation Error',
    html: `<ul style="text-align: left;">${errorList}</ul>`,
    confirmButtonText: 'OK',
    confirmButtonColor: '#dc3545',
    showCloseButton: true,
    allowOutsideClick: true,
    allowEscapeKey: true,
    buttonsStyling: true, // ✅ Use default SweetAlert2 button styling
  });
};

// Delete Confirmation
export const showDeleteConfirm = (itemName: string) => {
  return Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: `You won't be able to revert this! This will permanently delete ${itemName}.`,
    showCancelButton: true,
    showCloseButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    allowOutsideClick: true,
    allowEscapeKey: true,
    buttonsStyling: true, // ✅ Use default SweetAlert2 button styling
  });
};

// Success with Action Button
export const showSuccessWithAction = (
  title: string,
  text: string,
  actionText: string,
  actionUrl?: string
) => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonText: actionText,
    confirmButtonColor: '#28a745',
    showCancelButton: true,
    showCloseButton: true,
    cancelButtonText: 'Close',
    cancelButtonColor: '#6c757d',
    allowOutsideClick: true,
    allowEscapeKey: true,
    buttonsStyling: true, // ✅ Use default SweetAlert2 button styling
  }).then((result) => {
    if (result.isConfirmed && actionUrl) {
      window.location.href = actionUrl;
    }
  });
};
