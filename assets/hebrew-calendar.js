$(document).ready(function () {
  let yahrzeit
  $('#country').countrySelect()
  window.phoneInput = document.querySelector('#phone')
  window.phoneIti = window.intlTelInput(document.querySelector('#phone'), {
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
  })
  $("#calender_information_form input[name='s1']")
    .siblings('button')
    .click(function () {
      $(this)
        .removeClass('tw-bg-[#D6D2C8] tw-text-black')
        .addClass('tw-bg-black tw-text-white')
        .siblings('button')
        .removeClass('tw-bg-black tw-text-white')
        .addClass('tw-bg-[#D6D2C8] tw-text-black')
      $("#calender_information_form input[name='s1']").val(
        $(this).attr('data-value'),
      )
    })
  $('#advanced_settings').click(() => $('#advanced_settings_fields').toggle())
  $('#useCoordinates').click(() => $('#coordinates').toggle())

  const calenderInformationForm = $('#calender_information_form')
  calenderInformationForm.validate()
  calenderInformationForm.submit(async function (e) {
    e.preventDefault()
    if (!calenderInformationForm.valid()) return
    calenderInformationForm
      .find('button[type="submit"]')
      .prop('disabled', true)
      .find('svg')
      .show()
    const form = new FormData(e.target)
    form.append(
      'country',
      $('#country').countrySelect('getSelectedCountryData').iso2.toUpperCase(),
    )
    form.append('years', '10')
    form.append('cfg', 'json')
    form.append('v', 'yahrzeit')
    form.append('hebdate', 'on')
    form.append('yizkor', 'on')
    form.delete('n2')

    const yahrzeitResponse = await fetch('https://www.hebcal.com/yahrzeit', {
      method: 'POST',
      body: new URLSearchParams(form),
    })
    yahrzeit = await yahrzeitResponse.json()

    const formattedPassingDate = `${form.get('y1')}-${form.get('m1')}-${form.get('d1')}`
    const hebDate = await fetch(
      `https://www.hebcal.com/converter?cfg=json&date=${formattedPassingDate}&g2h=1&strict=1&gs=${form.get('s1')}`,
      {
        method: 'GET',
      },
    )

    const hebDateResponse = await hebDate.json()
    const hebDateData = `${hebDateResponse.hd} ${hebDateResponse.hm} ${hebDateResponse.hy}`
    const items = yahrzeit.items.filter(item => item.category === 'yahrzeit')
    const dataOfPassing = `${form.get('n1')} ${dateFns.format(formattedPassingDate, "EEEE',' MMMM dd',' yyyy")} - ${hebDateData}`
    $('.data-of-passing').text(dataOfPassing)
    $('#yahrzeit-information-and-reminders .upcoming-annual').html(/*html*/ `
      <div>
        ${dateFns.format(items[0].date, "EEEE 'evening,' MMMM dd")}
        through
        ${dateFns.format(dateFns.addDays(items[0].date, 1), "EEEE',' MMMM dd',' yyyy")}
      </div>
      <div>
        ${items[0].hdate}
      </div>
    `)
    $('#yahrzeit-information-and-reminders .yahrzeit-10-years').html(/*html*/ `
      <div class="tw-py-[60px]">
        Date of Passing: ${dataOfPassing}
      </div>
      <div class="tw-flex tw-flex-col tw-gap-[24px] tw-pb-[60px]">
        <div>Observe the upcoming annual Yahrzeits:</div>
        ${items
          .map(
            (item, index) => /*html*/ `
            <div class="">
              ${dateFns.format(item.date, "EEEE 'evening,' MMMM dd")} <br>
              through <br>
              ${dateFns.format(dateFns.addDays(item.date, 1), "EEEE',' MMMM dd',' yyyy")} <br>
              ${item.hdate}
              <div class="tw-border-t tw-border-black tw-border-dashed tw-w-[140px] tw-mx-auto tw-mt-[32px]"></div>
            </div>
          `,
          )
          .join('')}
      </div>
    `)
    $('.reminder-name').text(
      form.get('n1') + (form.get('n2') ? ` ${form.get('n2')}` : ''),
    )
    $('#yahrzeit-information-and-reminders').show().siblings().hide()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  $(
    '#yahrzeit-information-and-reminders .show-yahrtzeit-dates-for-next-10-years',
  ).click(function () {
    $('#yahrzeit-information-and-reminders .title').text(
      'Yahrzeit Dates for Next 10 Years',
    )
    $('#yahrzeit-information-and-reminders .schedule-free-reminders').text(
      'Go Back and Schedule Reminders > ',
    )
    $('#yahrzeit-information-and-reminders .yahrzeit-10-years').show()
    $('#yahrzeit-information-and-reminders .upcoming-annual-container').hide()
    $('#yahrzeit-information-and-reminders .data-of-passing').hide()
    $(this).hide()
  })

  $('#yahrzeit-information-and-reminders .schedule-free-reminders').click(
    () => {
      $('#create-yahrzeit-reminders').show().siblings().hide()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
  )

  $('#reminders_form input:checkbox').click(function () {
    $('.notification-count').text(
      $('#reminders_form input:checkbox:checked').length,
    )
    const name = $(this).attr('name')
    const isChecked = $(this).is(':checked')
    $(`#reminders_result_form input[name='${name}']`).prop('checked', isChecked)
    // if (isChecked) {
    //   $(`div[data-id="${name}"]`).show()
    // } else {
    //   $(`div[data-id="${name}"]`).hide()
    // }
  })

  $('#reminders_form .notification_type button').click(function () {
    $(this)
      .removeClass('tw-bg-[#D6D2C8] tw-text-black')
      .addClass('tw-bg-black tw-text-white')
      .siblings('button')
      .removeClass('tw-bg-black tw-text-white')
      .addClass('tw-bg-[#D6D2C8] tw-text-black')
    const notificationType = $(this).attr('data-value')
    $("#reminders_form input[name='notification_type']").val(notificationType)
    if (notificationType === 'sms') {
      $("#reminders_form input[name='email']").removeAttr('required')
      $("#reminders_form input[name='phone']").attr('required', true)
    }
    if (notificationType === 'email') {
      $("#reminders_form input[name='email']").attr('required', true)
      $("#reminders_form input[name='phone']").removeAttr('required')
    }
    if (notificationType === 'both') {
      $("#reminders_form input[name='email']").attr('required', true)
      $("#reminders_form input[name='phone']").attr('required', true)
    }
    $('#reminders_form').valid()
  })

  $('#reminders_form').validate()
  $('#reminders_form').submit(async function (e) {
    e.preventDefault()
    if (!$(this).valid()) return
    $('#reminders_result_form .reminders-result-action>button').attr(
      'disabled',
      true,
    )
    const remindersForm = new FormData(
      document.getElementById('reminders_form'),
    )
    const calenderInformationForm = new FormData(
      document.getElementById('calender_information_form'),
    )
    localStorage.setItem(
      'reminder',
      JSON.stringify({
        name:
          calenderInformationForm.get('n1') +
          (calenderInformationForm.get('n2')
            ? ` ${calenderInformationForm.get('n2')}`
            : ''),
        email: remindersForm.get('email'),
        phone: phoneIti.getNumber(),
        notificationType: remindersForm.get('notification_type'),
        tishrei1DateOfPassing:
          remindersForm.get('tishrei_1_date_of_passing') === 'on',
        priorToTheFastBeginningOnYomKippur:
          remindersForm.get('prior_to_the_fast_beginning_on_yom_kippur') ===
          'on',
        sheminiAtzeret: remindersForm.get('shemini_atzeret') === 'on',
        passover: remindersForm.get('passover') === 'on',
        shavuot: remindersForm.get('shavuot') === 'on',
        dates: yahrzeit.items,
        passingDate: dateFns.formatISO(
          dateFns.parse(
            `${calenderInformationForm.get('y1')}-${calenderInformationForm.get('m1')}-${calenderInformationForm.get('d1')}`,
            'yyyy-MM-dd',
            new Date(),
          ),
        ),
      }),
    )
    if (remindersForm.get('customerId')) {
      location.href = '/pages/reminders-result'
    } else {
      location.href = '/account/login'
    }
  })
})
