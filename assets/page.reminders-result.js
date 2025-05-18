$(document).ready(function () {
  const customerId = $("#reminders_result_form input[name='customerId']").val()
  if (!customerId) {
    location.href = '/account/login'
    return
  }
  const reminderJson = localStorage.getItem('reminder')
  if (!reminderJson) {
    location.href = '/pages/hebrew-calendar'
    return
  }
  const reminder = JSON.parse(reminderJson)
  reminder.customerId = customerId
  $(`#reminders_result_form input[name='tishrei_1_date_of_passing']`).prop(
    'checked',
    reminder.tishrei1DateOfPassing,
  )
  $(
    `#reminders_result_form input[name='prior_to_the_fast_beginning_on_yom_kippur']`,
  ).prop('checked', reminder.priorToTheFastBeginningOnYomKippur)
  $(`#reminders_result_form input[name='shemini_atzeret']`).prop(
    'checked',
    reminder.sheminiAtzeret,
  )
  $(`#reminders_result_form input[name='passover']`).prop(
    'checked',
    reminder.passover,
  )
  $(`#reminders_result_form input[name='shavuot']`).prop(
    'checked',
    reminder.shavuot,
  )

  $('.notification-count').text(
    (reminder.tishrei1DateOfPassing ? 1 : 0) +
      (reminder.priorToTheFastBeginningOnYomKippur ? 1 : 0) +
      (reminder.sheminiAtzeret ? 1 : 0) +
      (reminder.passover ? 1 : 0) +
      (reminder.shavuot ? 1 : 0),
  )

  $('#reminders_result_form input:checkbox').click(function () {
    $('.notification-count').text(
      $('#reminders_result_form input:checkbox:checked').length,
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

  $('#reminders_result_form .reminders-result-action>button').click(
    async function () {
      $('#reminders_result_form .reminders-result-action>button').attr(
        'disabled',
        true,
      )
      const reminderFormData = new FormData(
        document.getElementById('reminders_result_form'),
      )
      reminder.tishrei1DateOfPassing =
        reminderFormData.get('tishrei_1_date_of_passing') === 'on'
      reminder.priorToTheFastBeginningOnYomKippur =
        reminderFormData.get('prior_to_the_fast_beginning_on_yom_kippur') ===
        'on'
      reminder.sheminiAtzeret = reminderFormData.get('shemini_atzeret') === 'on'
      reminder.passover = reminderFormData.get('passover') === 'on'
      reminder.shavuot = reminderFormData.get('shavuot') === 'on'
      reminder.dates = reminder.dates
        .filter(
          ({ date, category, title }) =>
            dateFns.compareAsc(
              date,
              dateFns.format(new Date(), 'yyyy-MM-dd'),
            ) === 1 &&
            ((reminder.tishrei1DateOfPassing && category === 'yahrzeit') ||
              (reminder.priorToTheFastBeginningOnYomKippur &&
                title === 'Yizkor (Yom Kippur)') ||
              (reminder.sheminiAtzeret &&
                title === 'Yizkor (Shmini Atzeret)') ||
              (reminder.passover && title === 'Yizkor (Pesach VIII)') ||
              (reminder.shavuot && title === 'Yizkor (Shavuot II)')),
        )
        .map(item => ({
          ...item,
          date: dateFns.formatISO(
            dateFns.parse(item.date, 'yyyy-MM-dd', new Date()),
          ),
        }))

      const reminderResponse = await fetch(`${customerAppUrl}/reminder`, {
        method: 'POST',
        body: JSON.stringify(reminder),

        headers: {
          'Content-Type': 'application/json',
        },
      })
      const reminderJson = await reminderResponse.json()
      const remindersOnly = $(this).attr('data-reminders-only')
      $('.sealsubs-target-element [data-sls-selling_plan]').val(
        $(
          '.sealsubs-target-element [data-selling-plan-group-id] select.sls-select>option',
        ).attr('value'),
      )
      const items = [
        {
          ...Object.fromEntries(
            new FormData(
              document.querySelector('#reminder_product_form_container form'),
            ).entries(),
          ),
          properties: {
            _reminderId: reminderJson.id,
            For: reminder.name,
            'Number of Candles': $(
              '#reminders_result_form input:checkbox:checked',
            ).length,
          },
        },
      ]
      if (typeof remindersOnly === 'undefined' || remindersOnly === false) {
        items.push({
          ...Object.fromEntries(
            new FormData(
              document.querySelector(
                `#candle${
                  $('#reminders_result_form input:checkbox:checked').length
                }_product_form_container form`,
              ),
            ).entries(),
          ),
          properties: {
            _reminderId: reminderJson.id,
            For: reminder.name,
            'Number of Candles': $(
              '#reminders_result_form input:checkbox:checked',
            ).length,
          },
        })
      }

      await fetch(window.Shopify.routes.root + 'cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      })
      localStorage.removeItem('reminder')
      location.href = '/cart'
    },
  )
})
