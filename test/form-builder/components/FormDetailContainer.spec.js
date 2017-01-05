import React from 'react';
import { shallow, mount } from 'enzyme';
import chaiEnzyme from 'chai-enzyme';
import chai, { expect } from 'chai';
import { FormDetailContainer } from 'form-builder/components/FormDetailContainer.jsx';
import { ComponentStore } from 'bahmni-form-controls';
import sinon from 'sinon';
import { httpInterceptor } from 'common/utils/httpInterceptor';
import { formBuilderConstants } from 'form-builder/constants';

chai.use(chaiEnzyme());

describe('FormDetailContainer', () => {
  let getDesignerComponentStub;
  let getAllDesignerComponentsStub;
  const formData = {
    id: 1,
    name: 'someFormName',
    version: '1',
    uuid: 'someUuid',
    resources: [],
    published: false,
  };

  const publishedFormData = Object.assign({}, formData, { published: true });

  const formJson = { uuid: 'FID' };

  const formResource = {
    form: {
      name: 'someFormName',
      uuid: 'someUuid',
    },
    valueReference: JSON.stringify(formJson),
    dataType: formBuilderConstants.formResourceDataType,
    uuid: '',
  };

  const params =
    'v=custom:(id,uuid,name,version,published,auditInfo,' +
    'resources:(valueReference,dataType,uuid))';
  const formResourceURL = `${formBuilderConstants.formUrl}/${'FID'}?${params}`;

  const defaultProps = {
    params: { formUuid: 'FID' },
    routes: [],
    dispatch: () => {},
  };
  const context = { router: {} };

  const control = () => (<div></div>);

  before(() => {
    getDesignerComponentStub = sinon.stub(ComponentStore, 'getDesignerComponent');
    getDesignerComponentStub.returns({
      metadata: {
        attributes: [{ name: 'properties', dataType: 'complex', attributes: [] }],
      },
      control,
    });
    getAllDesignerComponentsStub = sinon.stub(
      ComponentStore,
      'getAllDesignerComponents',
      () => ({})
    );
  });

  after(() => {
    getDesignerComponentStub.restore();
    getAllDesignerComponentsStub.restore();
  });

  it('should render appropriate controls with appropriate props', () => {
    sinon.stub(httpInterceptor, 'get', () => Promise.resolve(formData));
    const wrapper = mount(
      <FormDetailContainer
        {...defaultProps}
      />, { context }
    );

    const formDetail = wrapper.find('FormDetail');
    expect(formDetail).to.have.prop('editForm');
    expect(formDetail.prop('formData')).to.equal(undefined);
    expect(formDetail).to.have.prop('publishForm');
    expect(formDetail).to.have.prop('saveFormResource');
    expect(formDetail).to.have.prop('setError');

    const notification = wrapper.find('NotificationContainer');
    expect(notification).to.have.prop('notifications');
    expect(notification).to.have.prop('closeMessage');

    const formBuilderBreadcrumbs = wrapper.find('FormBuilderBreadcrumbs');
    expect(formBuilderBreadcrumbs).to.have.prop('routes');
    httpInterceptor.get.restore();
  });

  it('should call the appropriate endpoint to fetch the formData', (done) => {
    sinon.stub(httpInterceptor, 'get', () => Promise.resolve(formData));
    const wrapper = mount(
      <FormDetailContainer
        {...defaultProps}
      />, { context }
    );
    const formDetail = wrapper.find('FormDetail');
    setTimeout(() => {
      expect(formDetail.prop('formData')).to.eql(formData);
      httpInterceptor.get.restore();
      done();
    }, 500);

    sinon.assert.calledWith(httpInterceptor.get, formResourceURL);
  });

  describe('when NOT published', () => {
    beforeEach(() => {
      sinon.stub(httpInterceptor, 'get', () => Promise.resolve(formData));
    });
    afterEach(() => {
      httpInterceptor.get.restore();
    });

    it('should show save button', () => {
      const wrapper = mount(
        <FormDetailContainer
          {...defaultProps}
        />, { context }
      );

      const saveButton = wrapper.find('.save-button');
      expect(saveButton.text()).to.equal('Save');
      expect(saveButton).to.have.prop('onClick');
    });

    it('should save form when save button is clicked', (done) => {
      sinon.stub(httpInterceptor, 'post', () => Promise.resolve(formData));
      const wrapper = mount(
        <FormDetailContainer
          {...defaultProps}
        />, { context }
      );
      sinon.stub(wrapper.instance(), 'getFormJson', () => formJson);
      const saveButton = wrapper.find('.save-button');

      setTimeout(() => {
        saveButton.simulate('click');
        sinon.assert.calledWith(
          httpInterceptor.post,
          formBuilderConstants.bahmniFormResourceUrl,
          formResource
        );

        httpInterceptor.post.restore();
        done();
      }, 500);
    });

    it('should show publish button', () => {
      const wrapper = mount(
        <FormDetailContainer
          {...defaultProps}
        />, { context }
      );

      const publishButton = wrapper.find('.publish-button');
      expect(publishButton.text()).to.equal('Publish');
      expect(publishButton).to.have.prop('onClick');
    });

    it('should publish form when the publish button is clicked', (done) => {
      sinon.stub(httpInterceptor, 'post', () => Promise.resolve(formData));
      const wrapper = mount(
        <FormDetailContainer
          {...defaultProps}
        />, { context }
      );
      sinon.stub(wrapper.instance(), 'getFormJson', () => formJson);
      const publishButton = wrapper.find('.publish-button');

      setTimeout(() => {
        publishButton.simulate('click');
        sinon.assert.calledWith(
          httpInterceptor.post,
          formBuilderConstants.bahmniFormPublishUrl(formData.uuid)
        );

        httpInterceptor.post.restore();
        done();
      }, 500);
    });

    it('should NOT show edit button', (done) => {
      const wrapper = mount(
        <FormDetailContainer
          {...defaultProps}
        />, { context }
      );
      const editButton = wrapper.find('.edit-button');

      setTimeout(() => {
        expect(editButton.nodes.length).to.equal(0);
        done();
      }, 500);
    });
  });

  describe('when published', () => {
    beforeEach(() => {
      sinon.stub(httpInterceptor, 'get', () => Promise.resolve(publishedFormData));
    });

    afterEach(() => {
      httpInterceptor.get.restore();
    });

    it('should show edit button', (done) => {
      const wrapper = shallow(
        <FormDetailContainer
          {...defaultProps}
        />, { context, store: {} }
      );
      wrapper.setState({ formData: publishedFormData });
      const editButton = wrapper.find('.edit-button');

      setTimeout(() => {
        expect(editButton.text()).to.equal('Edit');
        done();
      }, 500);
    });

    it('should make the form editable when edit button is clicked', (done) => {
      sinon.stub(window, 'confirm', () => true);
      const wrapper = shallow(
        <FormDetailContainer
          {...defaultProps}
        />, { context, store: {} }
      );

      wrapper.setState({ formData: publishedFormData });
      const editButton = wrapper.find('.edit-button');
      const formDetail = wrapper.find('FormDetail');
      editButton.simulate('click');

      setTimeout(() => {
        expect(formDetail.prop('formData').editable).to.equal(true);
        window.confirm.restore();
        done();
      }, 1000);
    });

    it('should NOT show publish button', (done) => {
      const wrapper = shallow(
        <FormDetailContainer
          {...defaultProps}
        />, { context }
      );
      wrapper.setState({ formData: publishedFormData });
      const publishButton = wrapper.find('.publish-button');

      setTimeout(() => {
        expect(publishButton.nodes.length).to.equal(0);
        done();
      }, 500);
    });
  });
});
