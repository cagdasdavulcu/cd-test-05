import * as React from "react";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";

import { CdTest05ConnectorConfig } from "../CdTest05ConnectorConfig";

describe("CdTest05TabConfig Component", () => {
    // Snapshot Test Sample
    it("should match the snapshot", () => {
        window.alert = jest.fn();
        const wrapper = shallow(<CdTest05ConnectorConfig />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    // Component Test Sample
    it("should render the tab", () => {
        const component = shallow(<CdTest05ConnectorConfig />);
        const divResult = component.containsMatchingElement(<div>Configure your Connector</div>);

        expect(divResult).toBeTruthy();
    });
});

