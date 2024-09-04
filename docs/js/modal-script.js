document.addEventListener('DOMContentLoaded', function () {
    const createCampaignButton = document.getElementById('createCampaignButton');
    const createCampaignModal = document.getElementById('createCampaignModal');
    const closeModalButton = document.getElementById('closeModal');

    createCampaignButton.addEventListener('click', function () {
        createCampaignModal.style.display = 'flex';
    });

    closeModalButton.addEventListener('click', function () {
        createCampaignModal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === createCampaignModal) {
            createCampaignModal.style.display = 'none';
        }
    });

});
