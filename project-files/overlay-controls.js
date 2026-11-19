function closeOverlaysOnOutsideClick() {
    document.addEventListener('click', (event) => {
        document.querySelectorAll('details[open]').forEach((dropdown) => {
            if (!dropdown.contains(event.target)) {
                dropdown.open = false;
            }
        });

        document.querySelectorAll('dialog[open]').forEach((dialog) => {
            if (dialog.id === 'howItWorksDialog' || dialog.id === 'chatDialog') return;
            if (event.target === dialog) {
                dialog.close();
            }
        });
    });
}