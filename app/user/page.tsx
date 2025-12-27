"use client";
import React, { useState } from "react";
import UserInfoForm from "./profile/profile";
import KeywordRecorder from "./keyword/keyword";
import SentenceRecorder from "./sentence/sentence";
import CrossCheckList from "./cross_check_list/CrossCheckList";
import MicTest from "./test_mic/test_mic";
import WizardLayout from "./components/WizardLayout";

type Step = 1 | 2 | 3 | 4 | 5;

export default function UserPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [userId, setUserId] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [micTestPassed, setMicTestPassed] = useState(false);
  const [keywordRecordingCompleted, setKeywordRecordingCompleted] = useState(false);
  const [profileValid, setProfileValid] = useState(false);
  const profileSubmitRef = React.useRef<(() => Promise<void>) | null>(null);

  const goNext = async () => {
    if (currentStep === 1 && !userId) {
      if (!profileValid) return;
      if (profileSubmitRef.current) {
        try {await profileSubmitRef.current();} 
        catch (err) {return;}
      } 
      else {return;}
    }
    if (currentStep < 5) setCurrentStep((prev) => (prev + 1) as Step)
  };

  const goBack = () => {if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as Step)};

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <UserInfoForm
            onCreated={(u) => {setUserId(u.id); setUserInfo(u)}}
            onValidityChange={(v) => setProfileValid(v)}
            onRegisterSubmit={(fn) => (profileSubmitRef.current = fn)}
          />
        );
      case 2:
        return <MicTest onPassed={() => setMicTestPassed(true)} />;
      case 3:
        return <KeywordRecorder userId={userId!} onComplete={() => setKeywordRecordingCompleted(true)} />;
      case 4:
        return <SentenceRecorder userId={userId!} />;
      case 5:
        return <CrossCheckList userId={userId!} />;
    }
  };

  return (
    <WizardLayout
      currentStep={currentStep}
      userInfo={userInfo}
      userId={userId}
      micTestPassed={micTestPassed}
      keywordRecordingCompleted={keywordRecordingCompleted}
      profileValid={profileValid}
      onStepChange={setCurrentStep}
      onBack={goBack}
      onNext={goNext}
    >
      {renderContent()}
    </WizardLayout>
  );
}