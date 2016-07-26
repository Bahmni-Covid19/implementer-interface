import React, { Component } from 'react';
import FormBuilder from 'form-builder/components/FormBuilder';
import { httpInterceptor } from 'common/utils/httpInterceptor';
import { formBuilderConstants } from 'form-builder/constants';

export default class FormBuilderContainer extends Component {

  constructor() {
    super();
    this.state = { data: [] };
    this.setState = this.setState.bind(this);
  }

  componentWillMount() {
    httpInterceptor
      .get(`${formBuilderConstants.formUrl}?v=custom:(id,uuid,name,version,published,auditInfo)`)
      .then((data) => {
        this.setState({ data: data.results });
      })
      .catch((error) => this.setState({ error }));
  }

  render() {
    return <FormBuilder data={this.state.data} error={this.state.error} />;
  }
}