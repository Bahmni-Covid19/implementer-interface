export const formBuilderConstants = {
  conceptUrl: '/openmrs/ws/rest/v1/concept',
  conceptRepresentation: 'custom:(uuid,set,display,allowDecimal,name:(uuid,name),' +
  'conceptClass:(uuid,name),datatype:(uuid,name),answers,hiNormal,lowNormal,' +
  'hiAbsolute,lowAbsolute,units,setMembers:(uuid,set,display,allowDecimal,name:(uuid,name),' +
  'conceptClass:(uuid,name),datatype:(uuid,name),' +
  'answers,hiNormal,lowNormal,hiAbsolute,lowAbsolute,units))',
  exceptionMessages: {
    conceptMissing: 'Please associate Concept to Obs',
  },
  // eslint-disable-next-line
  getFullConceptRepresentation: (conceptName) => `/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&locale=en&name=${conceptName}&v=bahmni`,
  formResourceUrl: (formUuid) => `/openmrs/ws/rest/v1/form/${formUuid}/resource`,
  bahmniFormResourceUrl: '/openmrs/ws/rest/v1/bahmniIE/save',
  bahmniFormPublishUrl: (formUuid) => `/openmrs/ws/rest/v1/bahmniIE/publish?formUuid=${formUuid}`,
  formResourceDataType: 'org.openmrs.customdatatype.datatype.FreeTextDatatype',
  formUrl: '/openmrs/ws/rest/v1/form',
  supportedDataTypes: 'Boolean,Text,Numeric,Coded,N/A',
};
