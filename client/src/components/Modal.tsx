import { useEffect, useRef, type ReactNode } from "react";

interface Props {
    title: string;
    onClose: () => void;
    children: ReactNode;
}

export function Modal({ title, onClose, children }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (dialog && !dialog.open) dialog.showModal();
    }, []);

    return (
        <dialog
            ref={dialogRef}
            className="modal"
            onClose={onClose}
            onClick={(e) => {
                // Klik på den mørke baggrund lukker vinduet
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button type="button" className="icon-button" onClick={onClose} aria-label="Luk">
                        ×
                    </button>
                </div>
                {children}
            </div>
        </dialog>
    );
}