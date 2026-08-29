/**
 * Web3Forms configuration.
 *
 * The access key is public by design: this is a static site deployed to GitHub
 * Pages, and Web3Forms is built for exactly that model — the key only allows
 * submitting to the inbox it is bound to. To change the destination inbox,
 * create a new key at https://web3forms.com and replace the value below.
 */
export const WEB3FORMS_ACCESS_KEY = '2d992da3-f0a8-4442-9643-489e55b323cf'

export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

/** Subject line and sender label shown in the delivered email. */
export const WEB3FORMS_SUBJECT = 'Neue Nachricht über dein Portfolio'
export const WEB3FORMS_FROM_NAME = 'Portfolio-Kontaktformular'
