$(document).ready(function () {
  window.phoneInput = document.querySelector('#RegisterForm-Number')
  window.phoneIti = window.intlTelInput(
    document.querySelector('#RegisterForm-Number'),
    {
      countrySearch: false,
      initialCountry: 'auto',
      nationalMode: true,
      strictMode: true,
      geoIpLookup: callback => {
        fetch('https://ipapi.co/json')
          .then(res => res.json())
          .then(data => callback(data.country_code))
          .catch(() => callback('us'))
      },
      utilsScript:
        'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/24.6.1/build/js/utils.min.js',
      formatOnDisplay: true,
    },
  )
})
