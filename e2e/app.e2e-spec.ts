import { AvamScratchpadPage } from './app.po';

describe('avam-scratchpad App', () => {
  let page: AvamScratchpadPage;

  beforeEach(() => {
    page = new AvamScratchpadPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
