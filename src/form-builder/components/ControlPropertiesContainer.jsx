import React, { Component, PropTypes } from 'react';
import { AutoComplete } from 'bahmni-form-controls';
import { formBuilderConstants as constants } from 'form-builder/constants';
import { connect } from 'react-redux';
import { selectSource, setChangedProperty, sourceChangedProperty } from 'form-builder/actions/control';
import { PropertyEditor } from 'form-builder/components/PropertyEditor.jsx';
import { httpInterceptor } from 'common/utils/httpInterceptor';
import { commonConstants } from 'common/constants';
import { UrlHelper } from 'form-builder/helpers/UrlHelper';

class ControlPropertiesContainer extends Component {
  constructor() {
    super();
    this.onSelect = this.onSelect.bind(this);
    this.onScriptChanged = this.onScriptChanged.bind(this);
  }

  onSelect(concept) {
    const conceptName = concept.name.name;
    httpInterceptor
      .get(new UrlHelper().getFullConceptRepresentation(conceptName))
      .then((data) => {
        const result = data.results[0];
        result.display = result.name.name;
        this.props.dispatch(selectSource(result, this.props.selectedControl.id));
      })
      .catch((error) => this.setErrorMessage(error));
  }

  onPropertyUpdate(properties, id) {
    this.props.dispatch(setChangedProperty(properties, id));
  }

  setErrorMessage(error) {
    const errorNotification = { message: error.message, type: commonConstants.responseType.error };
    this.setState({ notification: errorNotification });
    setTimeout(() => {
      this.setState({ notification: {} });
    }, commonConstants.toastTimeout);
  }

  displayAutoComplete() {
    const { selectedControl, conceptToControlMap } = this.props;
    const value = (conceptToControlMap && conceptToControlMap[selectedControl.id]);
    const disableAutoComplete = value !== undefined;
    const supportedDataTypes = (selectedControl.type === 'obsControl') ?
      constants.supportedObsDataTypes : constants.supportedObsGroupDataTypes;
    const dataTypesQueryParam = `dataTypes=${supportedDataTypes}`;
    const representation = `v=${constants.conceptRepresentation}&name=`;
    const queryParams = `?s=byDataType&${dataTypesQueryParam}&${representation}`;
    const optionsUrl = `${constants.conceptUrl}${queryParams}`;
    return (
      <AutoComplete
        autofocus
        disabled={disableAutoComplete}
        onValueChange={this.onSelect}
        optionsUrl={optionsUrl}
        value={value}
      />
    );
  }

  displayPropertyEditor() {
    const { selectedControl, selectedControl: { id, concept } } = this.props;
    if (concept) {
      return (
        <PropertyEditor
          metadata={selectedControl}
          onPropertyUpdate={(property) => this.onPropertyUpdate(property, id)}
        />
      );
    }
    return null;
  }

  displayControlPropertyDetails() {
    const { selectedControl } = this.props;
    if (selectedControl) {
      return (
        <div className="obs-control-wrap">
          {this.displayAutoComplete()}
          {this.displayPropertyEditor()}
        </div>
      );
    }
    return null;
  }

  onScriptChanged(event) {
    this.props.dispatch(sourceChangedProperty(event.target.value));
  }

  render() {
    let script ="";
    if(this.props.selectedControl && this.props.selectedControl.events) {
      script = this.props.selectedControl.events.onValueChange;
    }

    return (
      <div className="section-grid">
        <h2 className="header-title">Control Properties</h2>
        {this.displayControlPropertyDetails()}
        <textarea
          value= {script}
          onChange={this.onScriptChanged}
        />
      </div>
    );
  }
}

ControlPropertiesContainer.propTypes = {
  conceptToControlMap: PropTypes.object,
  dispatch: PropTypes.func,
  selectedControl: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    conceptToControlMap: state.conceptToControlMap,
    selectedControl: state.controlDetails.selectedControl,
  };
}

export default connect(mapStateToProps)(ControlPropertiesContainer);
