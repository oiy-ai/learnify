const createFakeElement = (text: string) => {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  const fakeElement = document.createElement('textarea');
  // Prevent zooming on iOS
  fakeElement.style.fontSize = '12pt';
  // Reset box model
  fakeElement.style.border = '0';
  fakeElement.style.padding = '0';
  fakeElement.style.margin = '0';
  // Move element out of screen horizontally
  fakeElement.style.position = 'absolute';
  fakeElement.style[isRTL ? 'right' : 'left'] = '-9999px';
  // Move element to the same position vertically
  const yPosition = window.pageYOffset || document.documentElement.scrollTop;
  fakeElement.style.top = `${yPosition}px`;

  fakeElement.setAttribute('readonly', '');
  fakeElement.value = text;

  return fakeElement;
};

function command(type: string) {
  try {
    return document.execCommand(type);
  } catch (err) {
    console.error(err);
    return false;
  }
}

export const fakeCopyAction = (text: string, container = document.body) => {
  let success = false;

  const fakeElement = createFakeElement(text);
  container.append(fakeElement);

  try {
    fakeElement.select();
    fakeElement.setSelectionRange(0, fakeElement.value.length);
    success = command('copy');
  } catch (err) {
    console.error(err);
  }

  fakeElement.remove();

  return success;
};
