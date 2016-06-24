import {expect} from 'chai';
import Mengwang from '../src/index';

describe('mengwang', () => {
  describe('init with default options', () => {
    const instance = new Mengwang({
      wsdl: 'abc'
    });
    it('should set debug to default value', () => {
      expect(instance.options.debug).to.equal(process.env.NODE_DEBUG && /\bmengwang\b/.test(process.env.NODE_DEBUG));
    });
  });
});
