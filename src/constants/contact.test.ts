import { CONTACT_EMAIL, CONTACT_MAILTO } from './contact';

describe('contact constants', () => {
  it('points Contact at the public crittercanteen inbox', () => {
    expect(CONTACT_EMAIL).toBe('contact@crittercanteen.com');
    expect(CONTACT_MAILTO).toBe('mailto:contact@crittercanteen.com');
  });
});
