import {expect} from 'chai';
import Mengwang from '../src/index';

describe('mengwang', () => {
  describe('init with default options', () => {
    const instance = new Mengwang();
    it('should set wsdl to default value', () => {
      expect(instance.options.debug).to.equal(Mengwang.defaultOptions.debug);
    });
  });
});
