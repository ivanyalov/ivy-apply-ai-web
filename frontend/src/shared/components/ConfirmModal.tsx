import React from "react";

interface ConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmText: string;
	cancelText: string;
	isLoading?: boolean;
	isDangerous?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText,
	cancelText,
	isLoading = false,
	isDangerous = false,
}) => {
	if (!isOpen) return null;

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<div
			className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
			onClick={handleBackdropClick}
		>
			<div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl transform transition-all">
				{/* Заголовок */}
				<div className="mb-4">
					<h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
					<p className="text-gray-600 leading-relaxed">{message}</p>
				</div>

				{/* Кнопки */}
				<div className="flex flex-col sm:flex-row gap-3 sm:gap-3 sm:justify-end">
					<button
						onClick={onClose}
						disabled={isLoading}
						className="px-6 py-3 text-white bg-gray-800 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{cancelText}
					</button>
					<button
						onClick={onConfirm}
						disabled={isLoading}
						className={`px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
							isDangerous
								? "bg-harvard-crimson text-white hover:bg-red-800"
								: "bg-blue-600 text-white hover:bg-blue-700"
						}`}
					>
						{isLoading ? "..." : confirmText}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmModal;
