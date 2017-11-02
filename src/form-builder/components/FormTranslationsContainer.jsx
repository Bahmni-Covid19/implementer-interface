import React, { Component, PropTypes } from 'react';
import { httpInterceptor } from 'common/utils/httpInterceptor';
import { UrlHelper } from 'form-builder/helpers/UrlHelper';
import NotificationContainer from 'common/Notification';
import Spinner from 'common/Spinner';
import FormBuilderHeader from 'form-builder/components/FormBuilderHeader.jsx';
import { FormBuilderBreadcrumbs } from 'form-builder/components/FormBuilderBreadcrumbs.jsx';
import { formBuilderConstants } from 'form-builder/constants';
import FormTranslationsGrid from 'form-builder/components/FormTranslationsGrid.jsx';
import { connect } from 'react-redux';
import { clearTranslations, removeLocaleTranslation, updateTranslations }
  from 'form-builder/actions/control';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import split from 'lodash/split';
import trim from 'lodash/trim';


class FormTranslationsContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      translationData: {},
      notification: {},
      httpReceived: false, loading: true,
      originalFormName: undefined,
      allowedLocales: [],
    };
    this.name = undefined;
    this.version = undefined;
    this.selectedLocale = undefined;
    this._updateStore = this._updateStore.bind(this);
    this._saveTranslations = this._saveTranslations.bind(this);
    this._createTranslationReqObject = this._createTranslationReqObject.bind(this);
    this._getTranslations = this._getTranslations.bind(this);
    this._generateTranslation = this._generateTranslation.bind(this);
    props.dispatch(clearTranslations());
  }

  componentDidMount() {
    const params = 'v=custom:(id,uuid,name,version)';
    this._getAllowedLocales().then((localeInfo) => {
      const { locales } = localeInfo;
      const allowedLocales = {};
      forEach(locales, (locale) => {
        allowedLocales[locale.code] = locale.nativeName;
      });
      this.setState({ allowedLocales });
      httpInterceptor
          .get(`${formBuilderConstants.formUrl}/${this.props.params.formUuid}?${params}`)
          .then((data) => {
            const { name, version } = data;
            this.name = name;
            this.version = version;
            const locale = localStorage.getItem('openmrsDefaultLocale');
            this._getTranslations(name, version, locale);
          }).catch(() => {
            this.setState({ loading: false });
          });
    }).catch(() => {
      this.setState({ loading: false });
    });
  }

  _getTranslations(name, version, locale) {
    this.setState({ loading: true });
    httpInterceptor
      .get(new UrlHelper().bahmniFormTranslateUrl(name, version, locale))
      .then((translations) => {
        this._createInitialValue(translations, locale);
        const { allowedLocales } = this.state;
        const data = this._getTranslationsInfo(locale, translations, allowedLocales);
        this.setState({ translationData: data, loading: false });
      }).catch(() => {
        this.setState({ loading: false });
      });
  }

  _getTranslationsInfo(locale, selectedTranslations, allowedLocales) {
    const defaultLocale = localStorage.getItem('openmrsDefaultLocale');
    const headers = this._getHeaders(allowedLocales, locale, defaultLocale);
    const { translationData } = this.state;
    const data = this._getTranslationsData(translationData.data,
      locale, defaultLocale, selectedTranslations);
    return Object.assign({}, { headers, data });
  }

  _getTranslationsData(translationData, locale, defaultLocale, selectedTranslations) {
    let defaultTranslation = translationData && translationData.length ?
      translationData[0] : null;
    defaultTranslation = (defaultTranslation && defaultLocale !== locale) ?
      defaultTranslation : null;

    return defaultTranslation ? [defaultTranslation, selectedTranslations] : [selectedTranslations];
  }

  _getHeaders(allowedLocales, locale, defaultLocale) {
    const headers = ['Translation Key'];
    headers.push(`Default Locale (${allowedLocales[defaultLocale]})`);

    if (defaultLocale !== locale) {
      headers.push(allowedLocales[locale]);
    }
    return headers;
  }

  _createInitialValue(translations, locale) {
    this._updateStore(translations, 'concepts', locale);
    this._updateStore(translations, 'labels', locale);
  }


  _updateStore(translations, type, locale) {
    forEach(translations[type], (values, key) => {
      this.props.dispatch(updateTranslations(Object.assign({}, { value: values[0], type,
        translationKey: key, locale })));
    });
  }

  _getAllowedLocales() {
    return httpInterceptor
      .get(formBuilderConstants.allowedLocalesUrl);
  }

  _showSaveButton() {
    return (
      <button
        className="fr save-button btn--highlight" onClick={this._saveTranslations}
      >Save</button>
    );
  }

  _saveTranslations() {
    this.setState({ loading: true });
    const { translations } = this.props;

    httpInterceptor.post(formBuilderConstants.saveTranslationsUrl,
      this._createTranslationReqObject(translations)).then(() => {
        this.setState({ loading: false });
      }).catch(() => {
        this.setState({ loading: false });
      });
  }

  _createTranslationReqObject(translations) {
    const { name, version } = this;
    return map(translations, (localeTranslation, locale) =>
      Object.assign(localeTranslation, {
        formName: name,
        version, locale,
      }));
  }

  _generateTranslation(element) {
    this.props.dispatch(removeLocaleTranslation(this.selectedLocale));
    this.selectedLocale = element.target.value;
    this._getTranslations(this.name, this.version, this.selectedLocale);
  }

  _createLocaleOptions(allowedLocales) {
    return (
      <select
        className="fr"
        onChange={this._generateTranslation}
      >
        {
          map(allowedLocales, (nativeName, code) =>
            <option key={code} value={code}>{nativeName}</option>
          )
        }
      </select>);
  }

  render() {
    const { translationData } = this.state;
    return (<div>
            <Spinner show={this.state.loading} />
            <NotificationContainer
              notification={this.state.notification}
            />
            <FormBuilderHeader />
            <div className="breadcrumb-wrap">
                <div className="breadcrumb-inner">
                    <div className="fl">
                        <FormBuilderBreadcrumbs routes={this.props.routes} />
                    </div>
                  <div className="fr">
                    {this._showSaveButton()}
                  </div>
                  <div>{this._createLocaleOptions(this.state.allowedLocales)}</div>
                </div>
            </div>
          <div className="container-content-wrap">
            <FormTranslationsGrid translationData={translationData} />
          </div>
        </div>);
  }
}

FormTranslationsContainer.propTypes = {
  dispatch: PropTypes.func,
  params: PropTypes.object.isRequired,
  routes: PropTypes.array,
  translations: PropTypes.object,
};

FormTranslationsContainer.contextTypes = {
  router: React.PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  translations: state.translations,
});

export default connect(mapStateToProps)(FormTranslationsContainer);
