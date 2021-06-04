{-# LANGUAGE DataKinds             #-}
{-# LANGUAGE DeriveGeneric         #-}
{-# LANGUAGE FlexibleInstances     #-}
{-# LANGUAGE MultiParamTypeClasses #-}
{-# LANGUAGE OverloadedStrings     #-}
{-# LANGUAGE QuasiQuotes           #-}

module RarestToken.Contracts.SuperRareToken where

import           Network.Ethereum.Contract.TH

[abiFrom|contracts/abis/SuperRareToken.json|]